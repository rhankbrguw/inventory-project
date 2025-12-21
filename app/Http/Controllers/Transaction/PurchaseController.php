<?php

namespace App\Http\Controllers\Transaction;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePurchaseRequest;
use App\Http\Resources\Transaction\PurchaseCartItemResource;
use App\Http\Resources\Transaction\PurchaseResource;
use App\Models\Inventory;
use App\Models\Location;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\Supplier;
use App\Models\Type;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class PurchaseController extends Controller
{
    public function create(Request $request): Response
    {
        $user = Auth::user();
        $accessibleLocationIds = $user->getAccessibleLocationIds();

        $locationsQuery = Location::orderBy("name")->with('type');

        if ($accessibleLocationIds) {
            $locationsQuery->whereIn('id', $accessibleLocationIds);
        }

        $allLocations = $locationsQuery->get();

        $filteredLocations = $allLocations->filter(function ($location) use ($user) {
            return $user->canTransactAtLocation($location->id, 'purchase');
        });

        $locationsWithPermissions = $filteredLocations->values()->map(function ($location) use ($user) {
            return [
                'id' => $location->id,
                'name' => $location->name,
                'role_at_location' => $user->getRoleCodeAtLocation($location->id),
            ];
        });

        $cartItems = $user
            ->purchaseCartItems()
            ->with(["product", "supplier"])
            ->get();

        $productsQuery = Product::query()
            ->with("defaultSupplier:id,name")
            ->when($accessibleLocationIds, function ($query) use ($accessibleLocationIds) {
                $query->whereHas('inventories', function ($q) use ($accessibleLocationIds) {
                    $q->whereIn('location_id', $accessibleLocationIds);
                });
            })
            ->when($request->input("search"), function ($query, $search) {
                $query
                    ->where("name", "like", "%{$search}%")
                    ->orWhere("sku", "like", "%{$search}%");
            })
            ->when($request->filled("type_id") && $request->input("type_id") !== "all", function ($query) use ($request) {
                $query->where("type_id", $request->input("type_id"));
            })
            ->when($request->filled("supplier_id") && $request->input("supplier_id") !== "all", function ($query) use ($request) {
                $supplierId = $request->input("supplier_id");
                if ($supplierId === 'null') {
                    $query->whereNull("default_supplier_id");
                } else {
                    $query->where("default_supplier_id", $supplierId);
                }
            })
            ->orderBy("name");

        return Inertia::render("Transactions/Purchases/Create", [
            "locations" => $locationsWithPermissions,
            "suppliers" => Supplier::orderBy("name")->get(["id", "name"]),
            "products" => $productsQuery->paginate(12)->withQueryString(),
            "paymentMethods" => Type::where("group", Type::GROUP_PAYMENT)->orderBy("name")->get(["id", "name"]),
            "productTypes" => Type::where("group", Type::GROUP_PRODUCT)->orderBy("name")->get(["id", "name"]),
            "cart" => PurchaseCartItemResource::collection($cartItems),
            "filters" => (object) $request->only(["search", "type_id", "supplier_id"]),
        ]);
    }

    public function store(StorePurchaseRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $user = $request->user();

        if (!$user->canTransactAtLocation($validated['location_id'], 'purchase')) {
            abort(403, 'Anda tidak memiliki hak akses Managerial untuk pembelian di lokasi ini.');
        }

        $totalCost = collect($validated["items"])->sum(fn($item) => $item["quantity"] * $item["cost_per_unit"]);
        $purchaseType = Type::where("group", Type::GROUP_TRANSACTION)->where("name", "Pembelian")->firstOrFail();

        DB::transaction(function () use ($validated, $totalCost, $purchaseType, $request) {
            $purchase = Purchase::create([
                "type_id" => $purchaseType->id,
                "location_id" => $validated["location_id"],
                "supplier_id" => $validated["supplier_id"],
                "user_id" => $request->user()->id,
                "reference_code" => "PO-" . now()->format("Ymd-His"),
                "transaction_date" => Carbon::parse($validated["transaction_date"])->format("Y-m-d"),
                "notes" => $validated["notes"],
                "payment_method_type_id" => $validated["payment_method_type_id"] ?? null,
                "status" => "completed",
                "total_cost" => $totalCost,
                "installment_terms" => $validated["installment_terms"],
                "payment_status" => $validated["installment_terms"] > 1 ? "pending" : "paid",
            ]);

            if ($validated["installment_terms"] > 1) {
                $this->createInstallments($purchase, $totalCost, $validated["installment_terms"], $validated["transaction_date"]);
            }

            foreach ($validated["items"] as $item) {
                $purchase->stockMovements()->create([
                    "product_id" => $item["product_id"],
                    "supplier_id" => $validated["supplier_id"],
                    "location_id" => $validated["location_id"],
                    "type" => "purchase",
                    "quantity" => $item["quantity"],
                    "cost_per_unit" => $item["cost_per_unit"],
                    "average_cost_per_unit" => $item["cost_per_unit"],
                    "notes" => $validated["notes"],
                ]);

                $inventory = Inventory::firstOrCreate(
                    ["product_id" => $item["product_id"], "location_id" => $validated["location_id"]],
                    ["quantity" => 0, "average_cost" => 0]
                );

                $newTotalQty = $inventory->quantity + $item["quantity"];
                $newAvgCost = ($inventory->quantity * $inventory->average_cost + $item["quantity"] * $item["cost_per_unit"]) / ($newTotalQty > 0 ? $newTotalQty : 1);

                $inventory->update(["quantity" => $newTotalQty, "average_cost" => $newAvgCost]);
            }

            $supplierId = $validated["supplier_id"];
            Auth::user()->purchaseCartItems()
                ->where(fn($q) => is_null($supplierId) ? $q->whereNull('supplier_id') : $q->where('supplier_id', $supplierId))
                ->whereIn('product_id', array_column($validated["items"], 'product_id'))
                ->delete();
        });

        return Redirect::route("transactions.index")->with("success", "Transaksi pembelian berhasil disimpan.");
    }

    private function createInstallments($transaction, $totalAmount, $terms, $startDate)
    {
        $amountPer = $totalAmount / $terms;
        $date = Carbon::parse($startDate);
        for ($i = 1; $i <= $terms; $i++) {
            $transaction->installments()->create([
                'installment_number' => $i,
                'amount' => $amountPer,
                'due_date' => $date->copy()->addMonths($i - 1),
                'status' => 'pending',
            ]);
        }
    }

    public function show(Purchase $purchase): Response
    {
        $user = Auth::user();
        $accessible = $user->getAccessibleLocationIds();
        if ($accessible && !in_array($purchase->location_id, $accessible)) {
            abort(403);
        }

        $purchase->load(["location", "supplier", "user", "paymentMethodType", "stockMovements.product", "type", "installments"]);
        return Inertia::render("Transactions/Purchases/Show", ["purchase" => PurchaseResource::make($purchase)]);
    }
}

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
    public function show(Purchase $purchase): Response
    {
        $user = Auth::user();
        $accessibleLocationIds = $user->getAccessibleLocationIds();
        if ($accessibleLocationIds && !in_array($purchase->location_id, $accessibleLocationIds)) {
            abort(403, 'Anda tidak memiliki akses ke transaksi ini.');
        }

        return Inertia::render("Transactions/Purchases/Show", [
            "purchase" => PurchaseResource::make(
                $purchase->load([
                    "location",
                    "supplier",
                    "user",
                    "stockMovements.product",
                    "paymentMethodType",
                    "type",
                ]),
            ),
        ]);
    }

    public function create(Request $request): Response
    {
        $user = Auth::user();
        $accessibleLocationIds = $user->getAccessibleLocationIds();

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
            ->when(
                $request->filled("type_id") && $request->input("type_id") !== "all",
                function ($query) use ($request) {
                    $query->where("type_id", $request->input("type_id"));
                },
            )
            ->orderBy("name");

        $products = $productsQuery->paginate(12)->withQueryString();

        $locationsQuery = Location::orderBy("name");
        if ($accessibleLocationIds) {
            $locationsQuery->whereIn('id', $accessibleLocationIds);
        }

        return Inertia::render("Transactions/Purchases/Create", [
            "locations" => $locationsQuery->get(["id", "name"]),
            "suppliers" => Supplier::orderBy("name")->get(["id", "name"]),
            "products" => $products,
            "paymentMethods" => Type::where("group", Type::GROUP_PAYMENT)
                ->orderBy("name")
                ->get(["id", "name"]),
            "productTypes" => Type::where("group", Type::GROUP_PRODUCT)
                ->orderBy("name")
                ->get(["id", "name"]),
            "cart" => PurchaseCartItemResource::collection($cartItems),
            "filters" => (object) $request->only(["search", "type_id"]),
        ]);
    }

    public function store(StorePurchaseRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $user = $request->user();
        $accessibleLocationIds = $user->getAccessibleLocationIds();
        if ($accessibleLocationIds && !in_array($validated['location_id'], $accessibleLocationIds)) {
            abort(403, 'Anda tidak memiliki akses ke lokasi ini.');
        }

        $totalCost = collect($validated["items"])->sum(function ($item) {
            return $item["quantity"] * $item["cost_per_unit"];
        });

        $purchaseType = Type::where("group", Type::GROUP_TRANSACTION)
            ->where("name", "Pembelian")
            ->firstOrFail();

        DB::transaction(function () use (
            $validated,
            $totalCost,
            $purchaseType,
            $request,
        ) {
            $purchase = Purchase::create([
                "type_id" => $purchaseType->id,
                "location_id" => $validated["location_id"],
                "supplier_id" => $validated["supplier_id"],
                "user_id" => $request->user()->id,
                "reference_code" => "PO-" . now()->format("Ymd-His"),
                "transaction_date" => Carbon::parse(
                    $validated["transaction_date"],
                )->format("Y-m-d"),
                "notes" => $validated["notes"],
                "payment_method_type_id" =>
                $validated["payment_method_type_id"] ?? null,
                "status" => "completed",
                "total_cost" => $totalCost,
            ]);

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
                    [
                        "product_id" => $item["product_id"],
                        "location_id" => $validated["location_id"],
                    ],
                    ["quantity" => 0, "average_cost" => 0],
                );

                $oldQty = $inventory->quantity;
                $oldAvgCost = $inventory->average_cost;
                $newQty = $item["quantity"];
                $newCost = $item["cost_per_unit"];

                $newTotalQty = $oldQty + $newQty;
                $newAvgCost =
                    ($oldQty * $oldAvgCost + $newQty * $newCost) /
                    ($newTotalQty > 0 ? $newTotalQty : 1);

                $inventory->update([
                    "quantity" => $newTotalQty,
                    "average_cost" => $newAvgCost,
                ]);
            }


            $supplierId = $validated["supplier_id"];
            Auth::user()
                ->purchaseCartItems()
                ->where(function ($query) use ($supplierId) {
                    if (is_null($supplierId)) {
                        $query->whereNull('supplier_id');
                    } else {
                        $query->where('supplier_id', $supplierId);
                    }
                })
                ->whereIn('product_id', array_column($validated["items"], 'product_id'))
                ->delete();
        });

        return Redirect::route("transactions.index")->with(
            "success",
            "Transaksi pembelian berhasil disimpan.",
        );
    }
}

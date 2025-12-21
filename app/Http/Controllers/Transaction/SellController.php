<?php

namespace App\Http\Controllers\Transaction;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSellRequest;
use App\Http\Resources\Transaction\SellCartItemResource;
use App\Http\Resources\Transaction\SellResource;
use App\Models\Customer;
use App\Models\Inventory;
use App\Models\Location;
use App\Models\Product;
use App\Models\Sell;
use App\Models\Type;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Str;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class SellController extends Controller
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
            return $user->canTransactAtLocation($location->id, 'sell');
        });

        $locationsWithPermissions = $filteredLocations->values()->map(function ($location) use ($user) {
            return [
                'id' => $location->id,
                'name' => $location->name,
                'role_at_location' => $user->getRoleCodeAtLocation($location->id),
            ];
        });

        $locationId = $request->input("location_id");
        $search = $request->input("search");
        $typeId = $request->input("type_id");

        if ($accessibleLocationIds && $locationId && !in_array($locationId, $accessibleLocationIds)) {
            $locationId = null;
        }
        if (!$locationId && $locationsWithPermissions->count() === 1) {
            $locationId = $locationsWithPermissions->first()['id'];
        }

        $cartItems = $user->sellCartItems()->with(["product", "location"])->get();

        $productsQuery = Product::query()
            ->with("defaultSupplier:id,name")
            ->when($search, fn($q, $s) => $q->where("name", "like", "%{$s}%")->orWhere("sku", "like", "%{$s}%"))
            ->when($typeId && $typeId !== "all", fn($q) => $q->where("type_id", $typeId))
            ->orderBy("name");

        if ($locationId) {
            $productsQuery->whereHas("inventories", fn($q) => $q->where("location_id", $locationId)->where("quantity", ">", 0));
        } else {
            $productsQuery->whereRaw("1 = 0");
        }

        return Inertia::render("Transactions/Sells/Create", [
            "locations" => $locationsWithPermissions,
            "customers" => Customer::orderBy("name")->get(["id", "name"]),
            "allProducts" => $productsQuery->paginate(12)->withQueryString(),
            "paymentMethods" => Type::where("group", Type::GROUP_PAYMENT)->orderBy("name")->get(["id", "name"]),
            "productTypes" => Type::where("group", Type::GROUP_PRODUCT)->orderBy("name")->get(["id", "name"]),
            "customerTypes" => Type::where("group", Type::GROUP_CUSTOMER)->orderBy("name")->get(["id", "name"]),
            "cart" => SellCartItemResource::collection($cartItems),
            "filters" => (object) $request->only(["location_id", "search", "type_id"]),
        ]);
    }

    public function store(StoreSellRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $user = $request->user();

        if (!$user->canTransactAtLocation($validated['location_id'], 'sell')) {
            abort(403, 'Lokasi ini tidak memiliki izin untuk Penjualan (POS). Cek Tipe/Level Lokasi.');
        }

        $itemsData = $validated["items"];

        try {
            DB::transaction(function () use ($validated, $itemsData, $request) {
                $totalPrice = collect($itemsData)->sum(fn($item) => $item["quantity"] * $item["sell_price"]);

                $refCode = "SL-" . now()->format("Ymd") . "-" . strtoupper(Str::random(4));
                while (Sell::where("reference_code", $refCode)->exists()) {
                    $refCode = "SL-" . now()->format("Ymd") . "-" . strtoupper(Str::random(4));
                }

                $sell = Sell::create([
                    "type_id" => $validated["type_id"],
                    "location_id" => $validated["location_id"],
                    "customer_id" => $validated["customer_id"],
                    "user_id" => $request->user()->id,
                    "reference_code" => $refCode,
                    "transaction_date" => $validated["transaction_date"],
                    "total_price" => $totalPrice,
                    "status" => $validated["status"],
                    "payment_method_type_id" => $validated["payment_method_type_id"],
                    "notes" => $validated["notes"],
                    "installment_terms" => $validated["installment_terms"],
                    "payment_status" => $validated["installment_terms"] > 1 ? "pending" : "paid",
                ]);

                if ($validated["installment_terms"] > 1) {
                    $this->createInstallments($sell, $totalPrice, $validated["installment_terms"], $validated["transaction_date"]);
                }

                foreach ($itemsData as $item) {
                    $inventory = Inventory::where("product_id", $item["product_id"])
                        ->where("location_id", $validated["location_id"])
                        ->firstOrFail();

                    $sell->stockMovements()->create([
                        "product_id" => $item["product_id"],
                        "location_id" => $validated["location_id"],
                        "type" => "sell",
                        "quantity" => -(float) $item["quantity"],
                        "cost_per_unit" => (float) $item["sell_price"],
                        "average_cost_per_unit" => $inventory->average_cost,
                        "customer_id" => $validated["customer_id"],
                        "notes" => $validated["notes"],
                    ]);

                    $inventory->decrement("quantity", (float) $item["quantity"]);
                }

                $request->user()->sellCartItems()->where("location_id", $validated["location_id"])->delete();
            });
        } catch (\Exception $e) {
            return Redirect::back()->with("error", "Gagal: " . $e->getMessage());
        }

        return Redirect::route("transactions.index")->with("success", "Penjualan berhasil disimpan.");
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

    public function show(Sell $sell): Response
    {
        $user = Auth::user();
        $accessible = $user->getAccessibleLocationIds();
        if ($accessible && !in_array($sell->location_id, $accessible)) {
            abort(403);
        }

        $sell->load(["location", "customer", "user", "paymentMethod", "stockMovements.product", "type", "installments"]);
        return Inertia::render("Transactions/Sells/Show", ["sell" => SellResource::make($sell)]);
    }
}

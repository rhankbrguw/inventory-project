<?php

namespace App\Http\Controllers\Transaction;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSellRequest;
use App\Http\Resources\Transaction\SellCartItemResource;
use App\Http\Resources\Transaction\SellResource;
use App\Models\Customer;
use App\Models\Location;
use App\Models\Product;
use App\Models\Sell;
use App\Models\SalesChannel;
use App\Models\Type;
use App\Traits\ManagesStock;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class SellController extends Controller
{
    use ManagesStock;

    public function create(Request $request): Response
    {
        $user = Auth::user();
        $accessibleLocationIds = $user->getAccessibleLocationIds();

        $locationsQuery = Location::orderBy("name")->with('type');
        if ($accessibleLocationIds) {
            $locationsQuery->whereIn('id', $accessibleLocationIds);
        }

        $allLocations = $locationsQuery->get();
        $filteredLocations = $allLocations->filter(fn($location) => $user->canTransactAtLocation($location->id, 'sell'));

        $locationsWithPermissions = $filteredLocations->values()->map(fn($location) => [
            'id' => $location->id,
            'name' => $location->name,
            'role_at_location' => $user->getRoleCodeAtLocation($location->id),
        ]);

        $locationId = $request->input("location_id");
        $search = $request->input("search");
        $typeId = $request->input("type_id");

        if ($accessibleLocationIds && $locationId && !in_array($locationId, $accessibleLocationIds)) {
            $locationId = null;
        }
        if (!$locationId && $locationsWithPermissions->count() === 1) {
            $locationId = $locationsWithPermissions->first()['id'];
        }

        $cartItems = $user->sellCartItems()->with(["product.prices", "location"])->get();

        $productsQuery = Product::with(["defaultSupplier:id,name", "prices"])
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
            "allProducts" => $productsQuery->paginate(12)->withQueryString()->through(fn($product) => array_merge($product->toArray(), [
                'channel_prices' => $product->prices->pluck('price', 'sales_channel_id'),
            ])),
            "paymentMethods" => Type::where("group", Type::GROUP_PAYMENT)->orderBy("name")->get(["id", "name"]),
            "productTypes" => Type::where("group", Type::GROUP_PRODUCT)->orderBy("name")->get(["id", "name"]),
            "customerTypes" => Type::where("group", Type::GROUP_CUSTOMER)->orderBy("name")->get(["id", "name"]),
            "salesChannels" => SalesChannel::where('is_active', true)->orderBy('name')->get(['id', 'name', 'code']),
            "cart" => SellCartItemResource::collection($cartItems),
            "filters" => (object) $request->only(["location_id", "search", "type_id"]),
        ]);
    }

    public function store(StoreSellRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $user = $request->user();

        if (!$user->canTransactAtLocation($validated['location_id'], 'sell')) {
            abort(403, 'Lokasi ini tidak memiliki izin untuk Penjualan.');
        }

        $itemsData = $validated["items"];
        $totalPrice = collect($itemsData)->sum(fn($item) => $item["quantity"] * $item["sell_price"]);
        $sellType = Type::where("group", Type::GROUP_TRANSACTION)->where("name", "Penjualan")->firstOrFail();

        DB::transaction(function () use ($validated, $itemsData, $totalPrice, $sellType, $request) {
            $sell = Sell::create([
                "type_id" => $sellType->id,
                "location_id" => $validated["location_id"],
                "customer_id" => $validated["customer_id"],
                "sales_channel_id" => $validated["sales_channel_id"] ?? null,
                "user_id" => $request->user()->id,
                "reference_code" => "SL-" . now()->format("Ymd-His"),
                "transaction_date" => Carbon::parse($validated["transaction_date"])->format("Y-m-d"),
                "total_price" => $totalPrice,
                "status" => $validated["status"] ?? 'completed',
                "payment_method_type_id" => $validated["payment_method_type_id"],
                "notes" => $validated["notes"],
                "installment_terms" => $validated["installment_terms"],
                "payment_status" => $validated["installment_terms"] > 1 ? "pending" : "paid",
            ]);

            if ($validated["installment_terms"] > 1) {
                $this->createInstallments($sell, $totalPrice, $validated["installment_terms"], $validated["transaction_date"]);
            }

            foreach ($itemsData as $item) {
                $product = Product::find($item["product_id"]);

                $this->handleStockOut(
                    product: $product,
                    locationId: $validated['location_id'],
                    qty: $item['quantity'],
                    sellPrice: $item['sell_price'],
                    type: 'sell',
                    ref: $sell,
                    notes: $validated['notes']
                );
            }

            $request->user()->sellCartItems()->where("location_id", $validated["location_id"])->delete();
        });

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

        $sell->load(["location", "customer", "salesChannel", "user", "paymentMethod", "stockMovements.product", "type", "installments"]);
        return Inertia::render("Transactions/Sells/Show", ["sell" => SellResource::make($sell)]);
    }
}

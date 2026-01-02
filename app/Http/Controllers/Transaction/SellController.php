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
use App\Models\Purchase;
use App\Models\User;
use App\Models\Role;
use App\Notifications\SellShipmentNotification;
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

        $filteredLocations = $allLocations
            ->filter(fn($location) => $user->canTransactAtLocation($location->id, 'sell'));

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

        $cartItems = $user->sellCartItems()
            ->with(["product.prices", "location"])
            ->get();

        $productsQuery = Product::with(["defaultSupplier:id,name", "prices"])
            ->when($search, fn($q, $s) => $q->where("name", "like", "%{$s}%")->orWhere("sku", "like", "%{$s}%"))
            ->when($typeId && $typeId !== "all", fn($q) => $q->where("type_id", $typeId))
            ->orderBy("name");

        if ($locationId) {
            $productsQuery->whereHas(
                "inventories",
                fn($q) =>
                $q->where("location_id", $locationId)->where("quantity", ">", 0)
            );
        } else {
            $productsQuery->whereRaw("1 = 0");
        }

        return Inertia::render("Transactions/Sells/Create", [
            "locations" => $locationsWithPermissions,
            "customers" => Customer::orderBy("name")->get(["id", "name"]),
            "allProducts" => $productsQuery
                ->paginate(12)
                ->withQueryString()
                ->through(fn($product) => array_merge(
                    $product->toArray(),
                    ['channel_prices' => $product->prices->pluck('price', 'sales_channel_id')]
                )),
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
        $totalPrice = collect($itemsData)
            ->sum(fn($item) => $item["quantity"] * $item["sell_price"]);

        $sellType = Type::where("group", Type::GROUP_TRANSACTION)
            ->where("name", "Penjualan")
            ->firstOrFail();

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
                "status" => $validated["status"] ?? 'Completed',
                "payment_method_type_id" => $validated["payment_method_type_id"],
                "notes" => $validated["notes"],
                "installment_terms" => $validated["installment_terms"],
                "payment_status" => $validated["installment_terms"] > 1 ? "pending" : "paid",
            ]);

            if ($validated["installment_terms"] > 1) {
                $this->createInstallments(
                    $sell,
                    $totalPrice,
                    $validated["installment_terms"],
                    $validated["transaction_date"]
                );
            }

            foreach ($itemsData as $item) {
                $product = Product::findOrFail($item["product_id"]);

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

            $request->user()
                ->sellCartItems()
                ->where("location_id", $validated["location_id"])
                ->delete();
        });

        return Redirect::route("transactions.index")
            ->with("success", "Penjualan berhasil disimpan.");
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
        $this->authorize('view', $sell);

        $user = Auth::user();

        $sell->load([
            "location",
            "customer",
            "salesChannel",
            "user",
            "paymentMethod",
            "stockMovements.product",
            "type",
            "installments",
        ]);

        $canShip = strtolower($sell->status) === 'pending' && $user->canTransactAtLocation($sell->location_id, 'sell');

        $targetLocId = $sell->customer?->related_location_id;

        $canReceive = strtolower($sell->status) === 'shipping'
            && $targetLocId
            && $user->canTransactAtLocation($targetLocId, 'purchase');

        return Inertia::render(
            "Transactions/Sells/Show",
            [
                "sell" => SellResource::make($sell),
                "canShip" => $canShip,
                "canReceive" => $canReceive,
            ]
        );
    }

    public function ship(Sell $sell): RedirectResponse
    {
        $user = Auth::user();

        if (!$user->canTransactAtLocation($sell->location_id, 'sell')) {
            abort(403, 'Anda tidak memiliki akses untuk mengirim pesanan ini.');
        }

        if (strtolower($sell->status) !== 'pending') {
            return back()->with('error', 'Pesanan tidak bisa dikirim. Status saat ini: ' . $sell->status);
        }

        $sell->update(['status' => 'shipping']);

        if ($sell->customer && $sell->customer->related_location_id) {

            $brmRoleId = Role::where('code', Role::CODE_BRANCH_MGR)->value('id');

            if ($brmRoleId) {
                $targetManagers = User::whereHas('locations', function ($q) use ($sell, $brmRoleId) {
                    $q->where('locations.id', $sell->customer->related_location_id)
                        ->where('location_user.role_id', $brmRoleId);
                })->get();

                foreach ($targetManagers as $manager) {
                    try {
                        $manager->notify(
                            new SellShipmentNotification($sell, $user->name)
                        );
                    } catch (\Throwable) {
                    }
                }
            }
        }

        return back()->with('success', 'Barang sedang dalam proses pengiriman.');
    }

    public function receive(Request $request, Sell $sell): RedirectResponse
    {
        $user = $request->user();
        $targetLocationId = $sell->customer->related_location_id;

        if (!$targetLocationId) {
            abort(400, 'Transaksi ini bukan penjualan antar-cabang.');
        }

        if (!$user->canTransactAtLocation($targetLocationId, 'purchase')) {
            abort(403, 'Anda tidak berhak menerima barang di cabang ini.');
        }

        if (strtolower($sell->status) !== 'shipping') {
            return back()->with('error', 'Barang belum dikirim atau sudah diterima.');
        }

        DB::transaction(function () use ($sell, $user, $targetLocationId) {

            $sell->update(['status' => 'Completed']);

            $purchaseType = Type::where('group', Type::GROUP_TRANSACTION)
                ->where('name', 'Pembelian')
                ->value('id');

            $purchase = Purchase::create([
                'type_id' => $purchaseType,
                'location_id' => $targetLocationId,
                'supplier_id' => null,
                'user_id' => $user->id,
                'reference_code' => 'PO-AUTO-' . now()->format('Ymd-His'),
                'transaction_date' => now(),
                'total_cost' => $sell->total_price,
                'status' => 'Completed',
                'notes' => 'Auto-generated from Sell Ref: ' . $sell->reference_code,
                'payment_status' => 'paid',
                'installment_terms' => 1,
            ]);

            foreach ($sell->stockMovements as $movementOut) {
                $this->handleStockIn(
                    product: $movementOut->product,
                    locationId: $targetLocationId,
                    qty: abs($movementOut->quantity),
                    cost: $movementOut->cost_per_unit,
                    type: 'purchase',
                    ref: $purchase,
                    notes: 'Terima barang dari Gudang Pusat'
                );
            }
        });

        return back()->with('success', 'Barang diterima! Stok cabang otomatis bertambah.');
    }
}

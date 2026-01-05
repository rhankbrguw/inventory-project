<?php

namespace App\Http\Controllers\Transaction;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSellRequest;
use App\Http\Resources\Transaction\SellCartItemResource;
use App\Http\Resources\Transaction\SellResource;
use App\Models\Customer;
use App\Models\Location;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\Role;
use App\Models\Sell;
use App\Models\SellItem;
use App\Models\StockMovement;
use App\Models\Type;
use App\Models\User;
use App\Notifications\SellAcceptedNotification;
use App\Notifications\SellCreatedNotification;
use App\Notifications\SellRejectedNotification;
use App\Notifications\SellShipmentNotification;
use App\Traits\ManagesStock;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class SellController extends Controller
{
    use ManagesStock;

    public function create(Request $request): Response
    {
        $user = Auth::user();
        $accessibleLocationIds = $user->getAccessibleLocationIds();

        $locationsQuery = Location::orderBy('name')->with('type');
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

        $locationId = $request->input('location_id');
        $search = $request->input('search');
        $typeId = $request->input('type_id');

        if ($accessibleLocationIds && $locationId && !in_array($locationId, $accessibleLocationIds)) {
            $locationId = null;
        }

        if (!$locationId && $locationsWithPermissions->count() === 1) {
            $locationId = $locationsWithPermissions->first()['id'];
        }

        $cartItems = $user->sellCartItems()
            ->with(['product.prices', 'location', 'salesChannel'])
            ->get();

        $productsQuery = Product::with(['defaultSupplier:id,name', 'prices'])
            ->when($search, fn($q, $s) => $q->where('name', 'like', "%{$s}%")->orWhere('sku', 'like', "%{$s}%"))
            ->when($typeId && $typeId !== 'all', fn($q) => $q->where('type_id', $typeId))
            ->orderBy('name');

        if ($locationId) {
            $productsQuery->whereHas(
                'inventories',
                fn($q) =>
                $q->where('location_id', $locationId)->where('quantity', '>', 0)
            );
        } else {
            $productsQuery->whereRaw('1 = 0');
        }

        return Inertia::render('Transactions/Sells/Create', [
            'locations' => $locationsWithPermissions,
            'customers' => Customer::orderBy('name')->get(['id', 'name']),
            'allProducts' => $productsQuery
                ->paginate(12)
                ->withQueryString()
                ->through(fn($product) => array_merge(
                    $product->toArray(),
                    ['channel_prices' => $product->prices->pluck('price', 'type_id')]
                )),
            'paymentMethods' => Type::where('group', Type::GROUP_PAYMENT)->orderBy('name')->get(['id', 'name']),
            'productTypes' => Type::where('group', Type::GROUP_PRODUCT)->orderBy('name')->get(['id', 'name']),
            'customerTypes' => Type::where('group', Type::GROUP_CUSTOMER)->orderBy('name')->get(['id', 'name']),
            'salesChannels' => Type::where('group', Type::GROUP_SALES_CHANNEL)->orderBy('name')->get(['id', 'name', 'code']),
            'cart' => SellCartItemResource::collection($cartItems),
            'filters' => (object) $request->only(['location_id', 'search', 'type_id']),
        ]);
    }

    public function store(StoreSellRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $user = $request->user();

        if (!$user->canTransactAtLocation($validated['location_id'], 'sell')) {
            abort(403, 'Lokasi ini tidak memiliki izin untuk Penjualan.');
        }

        $itemsData = $validated['items'];
        $totalPrice = collect($itemsData)->sum(fn($item) => $item['quantity'] * $item['sell_price']);

        $sellTypeId = Type::where('name', 'Penjualan')
            ->where('group', Type::GROUP_TRANSACTION)
            ->value('id');

        $customerId = $validated['customer_id'] ?? null;
        $targetLocationId = null;
        $initialStatus = 'Completed';

        if ($customerId) {
            $customer = Customer::find($customerId);
            if ($customer && $customer->related_location_id) {
                $initialStatus = Sell::STATUS_PENDING_APPROVAL;
                $targetLocationId = $customer->related_location_id;
            }
        }

        $headerChannelId = $validated['sales_channel_id'] ?? $validated['sales_channel_type_id'] ?? null;

        $installmentTerms = (int) ($validated['installment_terms'] ?? 1);

        $paymentStatus = $installmentTerms > 1 ? 'pending' : 'paid';

        DB::transaction(function () use ($request, $itemsData, $totalPrice, $validated, $initialStatus, $targetLocationId, $sellTypeId, $headerChannelId, $installmentTerms, $paymentStatus) {

            $sell = Sell::create([
                'type_id' => $sellTypeId,
                'location_id' => $request->location_id,
                'customer_id' => $request->customer_id,
                'user_id' => $request->user()->id,
                'reference_code' => 'SL-' . now()->format('YmdHis'),
                'transaction_date' => now(),
                'total_price' => $totalPrice,
                'status' => $initialStatus,
                'notes' => $request->notes,

                'sales_channel_type_id' => $headerChannelId,

                'payment_method_type_id' => $validated['payment_method_type_id'] ?? null,
                'installment_terms' => $installmentTerms,
                'payment_status' => $paymentStatus,
            ]);

            if ($installmentTerms > 1) {
                $this->createInstallments(
                    $sell,
                    $totalPrice,
                    $installmentTerms,
                    $validated['transaction_date'] ?? now()
                );
            }

            foreach ($itemsData as $item) {
                $itemChannelId = $item['sales_channel_id'] ?? $item['sales_channel_type_id'] ?? null;

                $product = Product::findOrFail($item['product_id']);
                $currentCost = $product->average_cost ?? 0;

                SellItem::create([
                    'sell_id' => $sell->id,
                    'product_id' => $item['product_id'],
                    'sales_channel_type_id' => $itemChannelId,
                    'quantity' => $item['quantity'],
                    'sell_price' => $item['sell_price'],
                    'cost_per_unit' => $currentCost,
                ]);

                if ($initialStatus === Sell::STATUS_PENDING_APPROVAL) {
                    StockMovement::create([
                        'product_id' => $item['product_id'],
                        'location_id' => $validated['location_id'],
                        'quantity' => -abs($item['quantity']),
                        'cost_per_unit' => $item['sell_price'],
                        'type' => 'sell',
                        'reference_type' => Sell::class,
                        'reference_id' => $sell->id,
                        'user_id' => $request->user()->id,
                        'date' => now(),
                        'notes' => 'Pending Approval',
                        'sales_channel_type_id' => $itemChannelId,
                    ]);
                } else {
                    $this->handleStockOut(
                        product: $product,
                        locationId: $validated['location_id'],
                        qty: $item['quantity'],
                        sellPrice: $item['sell_price'],
                        type: 'sell',
                        ref: $sell,
                        notes: $validated['notes'],
                        channelId: $itemChannelId
                    );
                }
            }

            $request->user()
                ->sellCartItems()
                ->where('location_id', $validated['location_id'])
                ->delete();

            if ($initialStatus === Sell::STATUS_PENDING_APPROVAL && $targetLocationId) {
                $managerRoleIds = Role::whereIn('code', [
                    Role::CODE_BRANCH_MGR,
                    Role::CODE_WAREHOUSE_MGR,
                ])->pluck('id');

                if ($managerRoleIds->isNotEmpty()) {
                    $targets = User::whereHas('locations', function ($q) use ($targetLocationId, $managerRoleIds) {
                        $q->where('locations.id', $targetLocationId)
                            ->whereIn('location_user.role_id', $managerRoleIds);
                    })->get();

                    foreach ($targets as $target) {
                        try {
                            $target->notify(new SellCreatedNotification($sell, $request->user()->name));
                        } catch (\Throwable) {
                            // Ignore notification errors
                        }
                    }
                }
            }
        });

        return Redirect::route('transactions.index')
            ->with('success', 'Penjualan berhasil disimpan.');
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

    public function approve(Sell $sell): RedirectResponse
    {
        $user = Auth::user();

        $targetLocationId = $sell->customer?->related_location_id;
        if (!$targetLocationId) {
            abort(404, 'Transaksi ini bukan penjualan antar-cabang.');
        }

        if (!$user->canTransactAtLocation($targetLocationId, 'purchase')) {
            abort(403);
        }

        if ($user->level > Role::THRESHOLD_MANAGERIAL) {
            return back()->with('error', 'Hanya Manager yang dapat menyetujui pesanan.');
        }

        if ($sell->status !== Sell::STATUS_PENDING_APPROVAL) {
            return back()->with('error', 'Status tidak valid.');
        }

        $sell->update([
            'status' => Sell::STATUS_APPROVED,
            'approved_by' => $user->id,
            'approved_at' => now(),
        ]);

        try {
            $sell->user->notify(new SellAcceptedNotification($sell, $user->name));
        } catch (\Throwable) {
        }

        return back()->with('success', 'Pesanan disetujui. Menunggu pengiriman.');
    }

    public function reject(Request $request, Sell $sell): RedirectResponse
    {
        $user = Auth::user();

        $targetLocationId = $sell->customer?->related_location_id;
        if (!$targetLocationId) {
            abort(404, 'Transaksi ini bukan penjualan antar-cabang.');
        }

        if (!$user->canTransactAtLocation($targetLocationId, 'purchase')) {
            abort(403);
        }

        if ($user->level > Role::THRESHOLD_MANAGERIAL) {
            return back()->with('error', 'Akses ditolak.');
        }

        $reason = $request->input('rejection_reason');

        $sell->update([
            'status' => Sell::STATUS_REJECTED,
            'rejected_by' => $user->id,
            'rejected_at' => now(),
            'rejection_reason' => $reason,
        ]);

        try {
            $sell->user->notify(new SellRejectedNotification($sell, $user->name, $reason));
        } catch (\Throwable) {
        }

        return back()->with('success', 'Pesanan ditolak.');
    }

    public function show(Sell $sell): Response
    {
        $this->authorize('view', $sell);

        $user = Auth::user();

        $sell->load([
            'location',
            'customer',
            'salesChannel',
            'user',
            'approver',
            'rejector',
            'paymentMethod',
            'type',
            'installments',
            'salesChannel',
            'items.product' => fn($q) => $q->withTrashed(),
            'items.salesChannel',
            'stockMovements.product' => fn($q) => $q->withTrashed(),
            'stockMovements.salesChannel',
        ]);

        $targetLocationId = $sell->customer?->related_location_id;

        return Inertia::render('Transactions/Sells/Show', [
            'sell' => SellResource::make($sell),
            'canApprove' => $sell->status === Sell::STATUS_PENDING_APPROVAL
                && $targetLocationId
                && $user->canTransactAtLocation($targetLocationId, 'purchase'),
            'canShip' => $sell->status === Sell::STATUS_APPROVED
                && $user->canTransactAtLocation($sell->location_id, 'sell'),
            'canReceive' => $sell->status === Sell::STATUS_SHIPPING
                && $targetLocationId
                && $user->canTransactAtLocation($targetLocationId, 'purchase'),
        ]);
    }

    public function ship(Sell $sell): RedirectResponse
    {
        $sell->load(['stockMovements.product']);

        $user = Auth::user();

        if (!$user->canTransactAtLocation($sell->location_id, 'sell')) {
            abort(403);
        }

        if ($sell->status !== Sell::STATUS_APPROVED) {
            return back()->with('error', 'Pesanan belum disetujui.');
        }

        DB::transaction(function () use ($sell, $user) {
            $sell->update(['status' => Sell::STATUS_SHIPPING]);

            $targetLocationId = $sell->customer?->related_location_id;

            if ($targetLocationId) {
                $targetRoleIds = Role::whereIn('code', [
                    Role::CODE_BRANCH_MGR,
                    Role::CODE_WAREHOUSE_MGR,
                ])->pluck('id');

                if ($targetRoleIds->isNotEmpty()) {
                    $receivers = User::whereHas('locations', function ($q) use ($targetLocationId, $targetRoleIds) {
                        $q->where('locations.id', $targetLocationId)
                            ->whereIn('location_user.role_id', $targetRoleIds);
                    })->get();

                    foreach ($receivers as $receiver) {
                        try {
                            $receiver->notify(new SellShipmentNotification($sell, $user->name));
                        } catch (\Throwable) {
                        }
                    }
                }
            }

            foreach ($sell->stockMovements as $movement) {
                $this->handleStockOut(
                    $movement->product,
                    $sell->location_id,
                    abs($movement->quantity),
                    $movement->cost_per_unit,
                    'sell',
                    $sell,
                    'Shipped'
                );
            }
        });

        return back()->with('success', 'Barang dikirim.');
    }

    public function receive(Request $request, Sell $sell): RedirectResponse
    {
        $user = $request->user();
        $targetLocationId = $sell->customer->related_location_id;

        if (!$targetLocationId) {
            abort(400, 'Transaksi ini bukan penjualan antar-cabang.');
        }

        if (!$user->canTransactAtLocation($targetLocationId, 'purchase')) {
            abort(403);
        }

        if ($sell->status !== Sell::STATUS_SHIPPING) {
            return back()->with('error', 'Barang belum dikirim.');
        }

        DB::transaction(function () use ($sell, $user, $targetLocationId) {
            $sell->update(['status' => Sell::STATUS_COMPLETED]);

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
                'notes' => "Internal Transfer dari: {$sell->location->name} (Ref: {$sell->reference_code})",
                'payment_method_type_id' => $sell->payment_method_type_id,
                'payment_status' => $sell->payment_status,
                'installment_terms' => $sell->installment_terms,
            ]);

            if ($sell->installment_terms > 1) {
                $this->createInstallments(
                    $purchase,
                    $sell->total_price,
                    $sell->installment_terms,
                    now()
                );
            }

            $outboundMovements = StockMovement::where('reference_type', Sell::class)
                ->where('reference_id', $sell->id)
                ->where('type', 'sell')
                ->with('product')
                ->get();

            foreach ($outboundMovements as $movementOut) {
                $this->handleStockIn(
                    product: $movementOut->product,
                    locationId: $targetLocationId,
                    qty: abs($movementOut->quantity),
                    cost: $movementOut->cost_per_unit,
                    type: 'purchase',
                    ref: $purchase,
                    notes: 'Received from ' . $sell->location->name
                );
            }
        });

        return back()->with('success', 'Barang diterima.');
    }
}

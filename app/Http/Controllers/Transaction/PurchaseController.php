<?php

namespace App\Http\Controllers\Transaction;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePurchaseRequest;
use App\Http\Resources\Transaction\PurchaseCartItemResource;
use App\Http\Resources\Transaction\PurchaseResource;
use App\Models\Location;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\PurchaseItem;
use App\Models\Role;
use App\Models\Supplier;
use App\Models\Type;
use App\Models\User;
use App\Notifications\PurchaseAcceptedNotification;
use App\Notifications\PurchaseCreatedNotification;
use App\Notifications\PurchaseRejectedNotification;
use App\Notifications\PurchaseShipmentNotification;
use App\Traits\ManagesStock;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class PurchaseController extends Controller
{
    use ManagesStock;

    public function create(Request $request): Response
    {
        $user = Auth::user();
        $accessibleLocationIds = $user->getAccessibleLocationIds();

        $fromLocationId = $request->input('from_location_id');
        $isInternalMode = !empty($fromLocationId);

        $locationsQuery = Location::orderBy('name')->with('type');
        if ($accessibleLocationIds) {
            $locationsQuery->whereIn('id', $accessibleLocationIds);
        }

        $allLocations = $locationsQuery->get();
        $filteredLocations = $allLocations->filter(fn($location) => $user->can('createAtLocation', [Purchase::class, $location->id]))->values();

        $locationsWithPermissions = $filteredLocations->map(fn($location) => [
            'id' => $location->id,
            'name' => $location->name,
            'role_at_location' => $user->getRoleCodeAtLocation($location->id),
        ]);

        $cartItems = $user->purchaseCartItems()->with(['product.defaultSupplier', 'supplier'])->get();

        $productsQuery = Product::with('defaultSupplier:id,name');

        if ($isInternalMode && $fromLocationId) {
            $productsQuery->with(['inventories' => function ($q) use ($fromLocationId) {
                $q->where('location_id', $fromLocationId);
            }])->whereHas('inventories', function ($q) use ($fromLocationId) {
                $q->where('location_id', $fromLocationId)->where('quantity', '>', 0);
            });
        } elseif (!$isInternalMode) {
            $productsQuery->when($accessibleLocationIds, fn($query) => $query->whereHas('inventories', fn($q) => $q->whereIn('location_id', $accessibleLocationIds)))
                ->when($request->input('search'), fn($query, $search) => $query->where('name', 'like', "%{$search}%")->orWhere('sku', 'like', "%{$search}%"))
                ->when($request->filled('type_id') && $request->input('type_id') !== 'all', fn($query) => $query->where('type_id', $request->input('type_id')))
                ->when($request->filled('supplier_id') && $request->input('supplier_id') !== 'all', function ($query) use ($request) {
                    $supplierId = $request->input('supplier_id');
                    return $supplierId === 'null'
                        ? $query->whereNull('default_supplier_id')
                        : $query->where('default_supplier_id', $supplierId);
                });
        } else {
            $productsQuery->whereRaw('1 = 0');
        }

        $productsQuery->orderBy('name');

        $warehouses = Location::whereHas('type', function ($q) {
            $q->where('code', Location::CODE_WAREHOUSE);
        })->orderBy('name')->get(['id', 'name']);

        $paginatedProducts = $productsQuery->paginate(12)->withQueryString();

        if ($isInternalMode) {
            $paginatedProducts->getCollection()->transform(function ($product) {
                $inventory = $product->inventories->first();
                $product->stock_quantity = $inventory ? $inventory->quantity : 0;

                $sellingPrice = $product->price;
                if ($inventory && !is_null($inventory->selling_price) && $inventory->selling_price > 0) {
                    $sellingPrice = $inventory->selling_price;
                }
                $product->price = $sellingPrice;
                return $product;
            });
        }

        return Inertia::render('Transactions/Purchases/Create', [
            'locations' => $locationsWithPermissions,
            'suppliers' => Supplier::orderBy('name')->get(['id', 'name']),
            'warehouses' => $warehouses,
            'products' => $paginatedProducts,
            'paymentMethods' => Type::where('group', Type::GROUP_PAYMENT)->orderBy('name')->get(['id', 'name']),
            'productTypes' => Type::where('group', Type::GROUP_PRODUCT)->orderBy('name')->get(['id', 'name']),
            'cart' => PurchaseCartItemResource::collection($cartItems),
            'filters' => (object) $request->only(['search', 'type_id', 'supplier_id', 'from_location_id']),
        ]);
    }

    public function store(StorePurchaseRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $user = $request->user();

        $this->authorize('createAtLocation', [Purchase::class, $validated['location_id']]);

        $totalCost = collect($validated['items'])->sum(fn($item) => $item['quantity'] * $item['cost_per_unit']);
        $purchaseType = Type::where('group', Type::GROUP_TRANSACTION)->where('name', 'Pembelian')->firstOrFail();

        $isInternal = !empty($validated['from_location_id']);

        $initialStatus = Purchase::STATUS_COMPLETED;

        if ($isInternal) {
            $roleAtWarehouse = $user->getRoleAtLocation($validated['from_location_id']);
            $isWarehouseManager = $user->level === Role::LEVEL_SUPER_ADMIN ||
                ($roleAtWarehouse && Role::isManagerial($roleAtWarehouse->level));

            $initialStatus = $isWarehouseManager
                ? Purchase::STATUS_APPROVED
                : Purchase::STATUS_PENDING_APPROVAL;
        }

        DB::transaction(function () use ($validated, $totalCost, $purchaseType, $request, $initialStatus, $isInternal) {
            $purchase = Purchase::create([
                'type_id' => $purchaseType->id,
                'location_id' => $validated['location_id'],
                'from_location_id' => $validated['from_location_id'] ?? null,
                'supplier_id' => $validated['supplier_id'],
                'user_id' => $request->user()->id,
                'reference_code' => 'PO-' . now()->format('Ymd-His'),
                'transaction_date' => Carbon::parse($validated['transaction_date'])->format('Y-m-d'),
                'notes' => $validated['notes'],
                'payment_method_type_id' => $validated['payment_method_type_id'] ?? null,
                'status' => $initialStatus,
                'total_cost' => $totalCost,
                'installment_terms' => $validated['installment_terms'] ?? 1,
                'payment_status' => ($validated['installment_terms'] ?? 1) > 1 ? 'pending' : 'paid',
            ]);

            foreach ($validated['items'] as $item) {
                PurchaseItem::create([
                    'purchase_id' => $purchase->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'cost_per_unit' => $item['cost_per_unit'],
                ]);
            }

            if ($initialStatus === Purchase::STATUS_COMPLETED) {
                $this->processStockIn($purchase);
                if (($validated['installment_terms'] ?? 1) > 1) {
                    $this->createInstallments($purchase, $totalCost, $validated['installment_terms'], $validated['transaction_date']);
                }
            }

            if ($initialStatus === Purchase::STATUS_PENDING_APPROVAL && $isInternal) {
                $this->notifyWarehouseManagers($purchase);
            }

            $supplierId = $validated['supplier_id'];
            $request->user()->purchaseCartItems()
                ->where(fn($q) => is_null($supplierId) ? $q->whereNull('supplier_id') : $q->where('supplier_id', $supplierId))
                ->whereIn('product_id', array_column($validated['items'], 'product_id'))
                ->delete();
        });

        $message = $initialStatus === Purchase::STATUS_PENDING_APPROVAL
            ? __('messages.transfer.created')
            : __('messages.purchase.created');

        return Redirect::route('transactions.index')->with('success', $message);
    }

    public function show(Purchase $purchase): Response
    {
        $this->authorize('view', $purchase);

        $purchase->load([
            'location',
            'fromLocation',
            'supplier',
            'user',
            'paymentMethodType',
            'items.product' => fn($q) => $q->withTrashed()->withoutGlobalScopes(),
            'type',
            'installments',
            'approver',
            'rejector'
        ]);

        return Inertia::render('Transactions/Purchases/Show', [
            'purchase' => PurchaseResource::make($purchase),
            'canApprove' => Auth::user()->can('approve', $purchase) && $purchase->status === Purchase::STATUS_PENDING_APPROVAL,
            'canReject' => Auth::user()->can('reject', $purchase) && $purchase->status === Purchase::STATUS_PENDING_APPROVAL,
            'canShip' => Auth::user()->can('ship', $purchase) && $purchase->status === Purchase::STATUS_APPROVED,
            'canReceive' => Auth::user()->can('receive', $purchase) && $purchase->status === 'Shipping',
        ]);
    }

    public function approve(Purchase $purchase): RedirectResponse
    {
        $this->authorize('approve', $purchase);
        if ($purchase->status !== Purchase::STATUS_PENDING_APPROVAL) {
            return back()->with('error', __('messages.transfer.invalid_status'));
        }

        $purchase->update([
            'status' => Purchase::STATUS_APPROVED,
            'approved_by' => Auth::id(),
            'approved_at' => now(),
        ]);

        if ($purchase->user && $purchase->user_id !== Auth::id()) {
            $purchase->user->notify(new PurchaseAcceptedNotification($purchase, Auth::user()->name));
        }

        return back()->with('success', __('messages.transfer.approved'));
    }

    public function reject(Request $request, Purchase $purchase): RedirectResponse
    {
        $this->authorize('reject', $purchase);
        $purchase->update([
            'status' => Purchase::STATUS_REJECTED,
            'rejected_by' => Auth::id(),
            'rejected_at' => now(),
            'rejection_reason' => $request->input('rejection_reason'),
        ]);

        if ($purchase->user && $purchase->user_id !== Auth::id()) {
            $purchase->user->notify(new PurchaseRejectedNotification($purchase, Auth::user()->name, $request->input('rejection_reason')));
        }
        return back()->with('success', __('messages.transfer.rejected'));
    }

    public function ship(Purchase $purchase): RedirectResponse
    {
        $this->authorize('ship', $purchase);

        $purchase->load(['items.product', 'location']);

        DB::transaction(function () use ($purchase) {
            $purchase->update(['status' => 'Shipping']);
            foreach ($purchase->items as $item) {
                $this->handleStockOut(
                    product: $item->product,
                    locationId: $purchase->from_location_id,
                    qty: $item->quantity,
                    sellPrice: $item->cost_per_unit,
                    type: 'sell',
                    ref: $purchase,
                    notes: "Dikirim ke " . $purchase->location->name
                );
            }
        });

        if ($purchase->user) {
            $purchase->user->notify(new PurchaseShipmentNotification($purchase, Auth::user()->name));
        }

        return back()->with('success', __('messages.transfer.shipped'));
    }

    public function receive(Purchase $purchase): RedirectResponse
    {
        $this->authorize('receive', $purchase);

        $purchase->load(['items.product']);

        DB::transaction(function () use ($purchase) {
            $purchase->update(['status' => Purchase::STATUS_COMPLETED]);
            $this->processStockIn($purchase);
        });

        return back()->with('success', __('messages.transfer.received'));
    }

    private function processStockIn(Purchase $purchase)
    {
        $items = $purchase->items()->with('product')->get();
        foreach ($items as $item) {
            $product = $item->product;
            if (!$purchase->isInternal()) {
                $currentGlobalStock = $product->inventories()->sum('quantity');
                $currentGlobalAvgCost = $product->average_cost ?? 0;
                $totalValueOld = $currentGlobalStock * $currentGlobalAvgCost;
                $incomingQty = $item->quantity;
                $incomingCost = $item->cost_per_unit;
                $totalQty = $currentGlobalStock + $incomingQty;
                if ($totalQty > 0) {
                    $newAvgCost = ($totalValueOld + ($incomingQty * $incomingCost)) / $totalQty;
                    $product->update(['average_cost' => $newAvgCost]);
                }
            }
            $this->handleStockIn(
                product: $product,
                locationId: $purchase->location_id,
                qty: $item->quantity,
                cost: $item->cost_per_unit,
                type: $purchase->isInternal() ? 'purchase' : 'purchase',
                ref: $purchase,
                notes: $purchase->notes
            );
        }
    }

    private function notifyWarehouseManagers(Purchase $purchase)
    {
        if (!$purchase->from_location_id) {
            return;
        }

        $managers = User::whereHas('locations', function ($q) use ($purchase) {
            $q->where('locations.id', $purchase->from_location_id)
                ->where('location_user.role_id', Role::where('code', Role::CODE_WAREHOUSE_MGR)->value('id'));
        })->get();

        foreach ($managers as $manager) {
            try {
                $manager->notify(new PurchaseCreatedNotification($purchase, Auth::user()->name));
            } catch (\Exception) {
                //
            }
        }
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
}

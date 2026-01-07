<?php

namespace App\Http\Controllers\Transaction;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreStockTransferRequest;
use App\Http\Resources\ProductResource;
use App\Http\Resources\Transaction\TransferResource;
use App\Models\Location;
use App\Models\Product;
use App\Models\StockTransfer;
use App\Models\StockMovement;
use App\Models\User;
use App\Models\Role;
use App\Notifications\StockTransferNotification;
use App\Notifications\TransferAcceptedNotification;
use App\Notifications\TransferRejectedNotification;
use App\Traits\ManagesStock;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class StockTransferController extends Controller
{
    use ManagesStock;

    public function create(): Response
    {
        $user = Auth::user();
        $accessibleLocationIds = $user->getAccessibleLocationIds();

        $sourceLocationsQuery = Location::orderBy('name')->with('type');

        if ($accessibleLocationIds) {
            $sourceLocationsQuery->whereIn('id', $accessibleLocationIds);
        }

        $sourceLocations = $sourceLocationsQuery->get()
            ->filter(fn($loc) => $user->can('createAtLocation', [StockTransfer::class, $loc->id]))
            ->map(fn($loc) => [
                'id' => $loc->id,
                'name' => $loc->name,
            ])
            ->values();

        $destinationLocations = Location::orderBy('name')->get(['id', 'name']);

        $productsQuery = Product::with([
            'inventories' => fn($q) => $q->where('quantity', '>', 0),
            'inventories.location:id,name',
        ])->orderBy('name');

        if ($accessibleLocationIds) {
            $productsQuery->whereHas(
                'inventories',
                fn($q) => $q->whereIn('location_id', $accessibleLocationIds)
                    ->where('quantity', '>', 0)
            );
        }

        $products = $productsQuery->get()->map(function ($product) {
            $product->locations = $product->inventories->map(fn($inv) => [
                'id' => $inv->location->id,
                'name' => $inv->location->name,
                'quantity' => $inv->quantity,
            ]);
            return $product;
        });

        return Inertia::render('Transactions/Transfers/Create', [
            'source_locations' => $sourceLocations,
            'destination_locations' => $destinationLocations,
            'products' => ProductResource::collection($products),
        ]);
    }

    public function store(StoreStockTransferRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $this->authorize('createAtLocation', [StockTransfer::class, $validated['from_location_id']]);

        $user = Auth::user();

        DB::transaction(function () use ($validated, $user) {
            $transfer = StockTransfer::create([
                'reference_code' => 'TRF-' . now()->format('YmdHis'),
                'from_location_id' => $validated['from_location_id'],
                'to_location_id' => $validated['to_location_id'],
                'user_id' => $user->id,
                'transfer_date' => $validated['transfer_date'] ?? now(),
                'notes' => $validated['notes'],
                'status' => StockTransfer::STATUS_PENDING_APPROVAL,
            ]);

            foreach ($validated['items'] as $item) {
                StockMovement::create([
                    'product_id' => $item['product_id'],
                    'location_id' => $validated['from_location_id'],
                    'quantity' => -abs($item['quantity']),
                    'type' => 'transfer_out',
                    'reference_type' => StockTransfer::class,
                    'reference_id' => $transfer->id,
                    'user_id' => $user->id,
                    'date' => $validated['transfer_date'] ?? now(),
                    'notes' => 'Pending Approval',
                ]);
            }

            $managerRoleIds = Role::whereIn('code', [
                Role::CODE_BRANCH_MGR,
                Role::CODE_WAREHOUSE_MGR,
            ])->pluck('id');

            if ($managerRoleIds->isNotEmpty()) {
                $targets = User::whereHas('locations', function ($q) use ($transfer, $managerRoleIds) {
                    $q->where('locations.id', $transfer->to_location_id)
                        ->whereIn('location_user.role_id', $managerRoleIds);
                })
                    ->where('id', '!=', $user->id)
                    ->get();

                foreach ($targets as $manager) {
                    $manager->notify(
                        new StockTransferNotification($transfer, $user->name, 'new_request')
                    );
                }
            }
        });

        return Redirect::route('transactions.index')
            ->with('success', 'Permintaan transfer dibuat.');
    }

    public function approve(StockTransfer $stockTransfer): RedirectResponse
    {
        $this->authorize('accept', $stockTransfer);

        if ($stockTransfer->status !== StockTransfer::STATUS_PENDING_APPROVAL) {
            return back()->with('error', 'Status tidak valid.');
        }

        $user = Auth::user();

        $stockTransfer->update([
            'status' => StockTransfer::STATUS_APPROVED,
        ]);

        try {
            $stockTransfer->user->notify(
                new TransferAcceptedNotification($stockTransfer, $user->name)
            );
        } catch (\Throwable) {
        }

        return back()->with('success', 'Transfer disetujui. Menunggu pengiriman.');
    }

    public function reject(Request $request, StockTransfer $stockTransfer): RedirectResponse
    {
        $this->authorize('reject', $stockTransfer);

        $user = Auth::user();
        $reason = $request->input('rejection_reason');

        $stockTransfer->update([
            'status' => StockTransfer::STATUS_REJECTED,
            'rejected_by' => $user->id,
            'rejected_at' => now(),
            'rejection_reason' => $reason,
        ]);

        try {
            $stockTransfer->user->notify(
                new TransferRejectedNotification($stockTransfer, $user->name, $reason)
            );
        } catch (\Throwable) {
        }

        return back()->with('success', 'Transfer ditolak.');
    }

    public function ship(StockTransfer $stockTransfer): RedirectResponse
    {
        $this->authorize('createAtLocation', [StockTransfer::class, $stockTransfer->from_location_id]);

        $stockTransfer->load(['items.product']);

        if ($stockTransfer->status !== StockTransfer::STATUS_APPROVED) {
            return back()->with('error', 'Belum disetujui.');
        }

        $user = Auth::user();

        DB::transaction(function () use ($stockTransfer, $user) {
            $stockTransfer->update([
                'status' => StockTransfer::STATUS_SHIPPING,
            ]);

            $targetRoleIds = Role::whereIn('code', [
                Role::CODE_BRANCH_MGR,
                Role::CODE_WAREHOUSE_MGR,
            ])->pluck('id');

            if ($targetRoleIds->isNotEmpty()) {
                $receivers = User::whereHas('locations', function ($q) use ($stockTransfer, $targetRoleIds) {
                    $q->where('locations.id', $stockTransfer->to_location_id)
                        ->whereIn('location_user.role_id', $targetRoleIds);
                })->get();

                foreach ($receivers as $receiver) {
                    try {
                        $receiver->notify(new \App\Notifications\TransferShippedNotification(
                            $stockTransfer,
                            $user->name
                        ));
                    } catch (\Throwable) {
                    }
                }
            }

            foreach ($stockTransfer->items as $movement) {
                $product = $movement->product;
                $qty = abs($movement->quantity);

                $movement->delete();

                $this->handleStockOut(
                    $product,
                    $stockTransfer->from_location_id,
                    $qty,
                    0,
                    'transfer_out',
                    $stockTransfer,
                    'Shipped'
                );
            }
        });

        return back()->with('success', 'Barang dikirim.');
    }

    public function receive(Request $request, StockTransfer $stockTransfer): RedirectResponse
    {
        $this->authorize('accept', $stockTransfer);

        if ($stockTransfer->status !== StockTransfer::STATUS_SHIPPING) {
            return back()->with('error', 'Belum dikirim.');
        }

        $user = $request->user();

        DB::transaction(function () use ($stockTransfer, $user) {
            $stockTransfer->update([
                'status' => StockTransfer::STATUS_COMPLETED,
                'received_by' => $user->id,
                'received_at' => now(),
            ]);

            $outboundMovements = StockMovement::where('reference_type', StockTransfer::class)
                ->where('reference_id', $stockTransfer->id)
                ->where('type', 'transfer_out')
                ->with('product')
                ->get();

            foreach ($outboundMovements as $movementOut) {
                $this->handleStockIn(
                    $movementOut->product,
                    $stockTransfer->to_location_id,
                    abs($movementOut->quantity),
                    $movementOut->average_cost_per_unit ?? 0,
                    'transfer_in',
                    $stockTransfer,
                    'Received'
                );
            }
        });

        return back()->with('success', 'Barang diterima.');
    }

    public function show(StockTransfer $stockTransfer): Response
    {
        $this->authorize('view', $stockTransfer);

        $user = Auth::user();

        $stockTransfer->load([
            'fromLocation',
            'toLocation',
            'user',
            'receiver',
            'rejector',
            'items.product',
        ]);

        return Inertia::render('Transactions/Transfers/Show', [
            'transfer' => new TransferResource($stockTransfer),
            'canApprove' => $stockTransfer->status === StockTransfer::STATUS_PENDING_APPROVAL
                && $user->can('accept', $stockTransfer),
            'canShip' => $stockTransfer->status === StockTransfer::STATUS_APPROVED
                && $user->can('createAtLocation', [StockTransfer::class, $stockTransfer->from_location_id]),
            'canReceive' => $stockTransfer->status === StockTransfer::STATUS_SHIPPING
                && $user->can('accept', $stockTransfer),
        ]);
    }
}

<?php

namespace App\Http\Controllers\Transaction;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreStockTransferRequest;
use App\Http\Resources\ProductResource;
use App\Http\Resources\Transaction\TransferResource;
use App\Models\Inventory;
use App\Models\Location;
use App\Models\Product;
use App\Models\StockTransfer;
use App\Models\User;
use App\Notifications\StockTransferNotification;
use App\Notifications\TransferAcceptedNotification;
use App\Notifications\TransferRejectedNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class StockTransferController extends Controller
{
    public function create(): Response
    {
        $user = Auth::user();
        $accessibleLocationIds = $user->getAccessibleLocationIds();

        $sourceLocationsQuery = Location::orderBy('name')->with('type');
        if ($accessibleLocationIds) {
            $sourceLocationsQuery->whereIn('id', $accessibleLocationIds);
        }

        $allSourceLocations = $sourceLocationsQuery->get();

        $sourceLocations = $allSourceLocations
            ->filter(fn ($location) => $user->canTransactAtLocation($location->id, 'transfer'))
            ->values()
            ->map(fn ($loc) => ['id' => $loc->id, 'name' => $loc->name]);

        $destinationLocations = Location::orderBy('name')->get(['id', 'name']);

        $productsQuery = Product::with([
            'inventories' => fn ($q) => $q->where('quantity', '>', 0)->select('id', 'product_id', 'location_id', 'quantity'),
            'inventories.location:id,name'
        ])->select('id', 'name', 'sku', 'unit')->orderBy('name');

        if ($accessibleLocationIds) {
            $productsQuery->whereHas(
                'inventories',
                fn ($q) => $q->whereIn('location_id', $accessibleLocationIds)->where('quantity', '>', 0)
            );
        }

        $products = $productsQuery->get()->map(function ($product) {
            $product->locations = $product->inventories->map(fn ($inv) => [
                'id' => $inv->location->id,
                'name' => $inv->location->name,
                'quantity' => $inv->quantity
            ])->values();
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
        $user = $request->user();

        $this->authorize('createAtLocation', [StockTransfer::class, $validated['from_location_id']]);

        $transfer = DB::transaction(function () use ($validated, $user) {
            $transfer = StockTransfer::create([
                'reference_code' => 'TRF-' . now()->format('Ymd-His'),
                'from_location_id' => $validated['from_location_id'],
                'to_location_id' => $validated['to_location_id'],
                'user_id' => $user->id,
                'transfer_date' => now(),
                'notes' => $validated['notes'],
                'status' => 'pending',
            ]);

            $productIds = array_column($validated['items'], 'product_id');
            $inventories = Inventory::whereIn('product_id', $productIds)
                ->where('location_id', $validated['from_location_id'])
                ->pluck('average_cost', 'product_id');

            $movements = [];
            foreach ($validated['items'] as $item) {
                $cost = $inventories[$item['product_id']] ?? 0;
                $qty = abs($item['quantity']);

                $movements[] = [
                    'reference_type' => StockTransfer::class,
                    'reference_id' => $transfer->id,
                    'product_id' => $item['product_id'],
                    'location_id' => $validated['from_location_id'],
                    'type' => 'transfer_out',
                    'quantity' => -$qty,
                    'cost_per_unit' => $cost,
                    'average_cost_per_unit' => $cost,
                    'notes' => $validated['notes'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ];

                $movements[] = [
                    'reference_type' => StockTransfer::class,
                    'reference_id' => $transfer->id,
                    'product_id' => $item['product_id'],
                    'location_id' => $validated['to_location_id'],
                    'type' => 'transfer_in',
                    'quantity' => $qty,
                    'cost_per_unit' => $cost,
                    'average_cost_per_unit' => $cost,
                    'notes' => $validated['notes'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }

            DB::table('stock_movements')->insert($movements);

            return $transfer;
        });

        $targetManagerIds = DB::table('location_user')
            ->join('roles', 'location_user.role_id', '=', 'roles.id')
            ->where('location_user.location_id', $transfer->to_location_id)
            ->where('roles.level', '>', 1)
            ->where('roles.level', '<=', 10)
            ->where('location_user.user_id', '!=', $user->id)
            ->pluck('location_user.user_id');

        if ($targetManagerIds->isEmpty()) {
            return Redirect::route('transactions.transfers.show', $transfer)
                ->with('success', 'Transfer stok menunggu konfirmasi.');
        }

        $targetManagers = User::select('id', 'name', 'email', 'phone')
            ->whereIn('id', $targetManagerIds)
            ->get();

        foreach ($targetManagers as $manager) {
            try {
                $manager->notify(new StockTransferNotification($transfer, $user->name));
            } catch (\Exception) {
            }
        }

        return Redirect::route('transactions.transfers.show', $transfer)
            ->with('success', 'Transfer stok menunggu konfirmasi.');
    }

    public function show(StockTransfer $stockTransfer): Response
    {
        $this->authorize('view', $stockTransfer);

        $canAccept = Auth::user()->can('accept', $stockTransfer);

        $stockTransfer->load([
            'fromLocation:id,name',
            'toLocation:id,name',
            'user:id,name',
            'receivedBy:id,name',
            'rejectedBy:id,name',
            'stockMovements' => function ($q) {
                $q->where('type', 'transfer_out')
                    ->select('id', 'reference_type', 'reference_id', 'product_id', 'quantity', 'cost_per_unit')
                    ->with(['product' => fn ($q) => $q->withTrashed()->select('id', 'name', 'sku', 'unit', 'deleted_at')]);
            }
        ]);

        return Inertia::render('Transactions/Transfers/Show', [
            'transfer' => new TransferResource($stockTransfer),
            'can_accept' => $canAccept,
        ]);
    }

    public function accept(Request $request, StockTransfer $stockTransfer): RedirectResponse
    {
        $this->authorize('accept', $stockTransfer);

        if ($stockTransfer->status !== 'pending') {
            return back()->with('error', 'Transfer sudah diproses sebelumnya.');
        }

        DB::transaction(function () use ($stockTransfer, $request) {
            $stockTransfer->update([
                'status' => 'completed',
                'received_by' => $request->user()->id,
                'received_at' => now(),
            ]);

            $movements = $stockTransfer->stockMovements()
                ->where('type', 'transfer_out')
                ->select('product_id', 'quantity', 'cost_per_unit')
                ->get();

            foreach ($movements as $movement) {
                $qty = abs($movement->quantity);

                Inventory::where('product_id', $movement->product_id)
                    ->where('location_id', $stockTransfer->from_location_id)
                    ->decrement('quantity', $qty);

                $destInv = Inventory::firstOrNew([
                    'product_id' => $movement->product_id,
                    'location_id' => $stockTransfer->to_location_id
                ]);

                $oldQty = $destInv->quantity ?? 0;
                $oldCost = $destInv->average_cost ?? 0;
                $totalQty = $oldQty + $qty;

                $destInv->quantity = $totalQty;
                $destInv->average_cost = $totalQty > 0
                    ? (($oldQty * $oldCost) + ($qty * $movement->cost_per_unit)) / $totalQty
                    : 0;

                $destInv->save();
            }
        });

        $sender = $stockTransfer->user;
        if ($sender && $sender->roles()->where('level', '>', 1)->exists()) {
            try {
                $sender->notify(
                    new TransferAcceptedNotification($stockTransfer, $request->user()->name)
                );
            } catch (\Exception) {
            }
        }

        return back()->with('success', 'Transfer berhasil diterima.');
    }

    public function reject(Request $request, StockTransfer $stockTransfer): RedirectResponse
    {
        $this->authorize('reject', $stockTransfer);

        if ($stockTransfer->status !== 'pending') {
            return back()->with('error', 'Transfer sudah diproses sebelumnya.');
        }

        $validated = $request->validate([
            'rejection_reason' => 'required|string|max:500',
        ]);

        $stockTransfer->update([
            'status' => 'rejected',
            'rejected_by' => $request->user()->id,
            'rejected_at' => now(),
            'rejection_reason' => $validated['rejection_reason'],
        ]);

        $sender = $stockTransfer->user;
        if ($sender && $sender->roles()->where('level', '>', 1)->exists()) {
            try {
                $sender->notify(
                    new TransferRejectedNotification(
                        $stockTransfer,
                        $request->user()->name,
                        $validated['rejection_reason']
                    )
                );
            } catch (\Exception) {
            }
        }

        return back()->with('success', 'Transfer ditolak.');
    }
}

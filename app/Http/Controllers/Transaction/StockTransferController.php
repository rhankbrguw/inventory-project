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
            ->filter(fn($loc) => $user->canTransactAtLocation($loc->id, 'transfer'))
            ->map(fn($loc) => ['id' => $loc->id, 'name' => $loc->name])
            ->values();

        $destinationLocations = Location::orderBy('name')->get(['id', 'name']);

        $productsQuery = Product::with([
            'inventories' => fn($q) => $q->where('quantity', '>', 0),
            'inventories.location:id,name'
        ])->orderBy('name');

        if ($accessibleLocationIds) {
            $productsQuery->whereHas(
                'inventories',
                fn($q) => $q->whereIn('location_id', $accessibleLocationIds)->where('quantity', '>', 0)
            );
        }

        $products = $productsQuery->get()->map(function ($product) {
            $product->locations = $product->inventories->map(function ($inv) {
                return [
                    'id' => $inv->location->id,
                    'name' => $inv->location->name,
                    'quantity' => $inv->quantity,
                ];
            });
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

        if (!$user->canTransactAtLocation($validated['from_location_id'], 'transfer')) {
            abort(403, 'Anda tidak memiliki akses untuk transfer dari lokasi ini.');
        }

        $transfer = DB::transaction(function () use ($validated, $user) {
            $transfer = StockTransfer::create([
                'reference_code'     => 'TRF-' . now()->format('Ymd-His'),
                'from_location_id'   => $validated['from_location_id'],
                'to_location_id'     => $validated['to_location_id'],
                'user_id'            => $user->id,
                'transfer_date'      => now(),
                'notes'              => $validated['notes'],
                'status'             => 'pending',
            ]);

            foreach ($validated['items'] as $item) {
                $product = Product::findOrFail($item['product_id']);
                $qty = abs($item['quantity']);

                $inventory = Inventory::where('product_id', $product->id)
                    ->where('location_id', $validated['from_location_id'])
                    ->first();

                $cost = $inventory ? $inventory->average_cost : 0;

                $this->handleStockOut(
                    product: $product,
                    locationId: $validated['from_location_id'],
                    qty: $qty,
                    sellPrice: $cost,
                    type: 'transfer_out',
                    ref: $transfer,
                    notes: $validated['notes']
                );
            }

            return $transfer;
        });

        $targetManagerIds = DB::table('location_user')
            ->join('roles', 'location_user.role_id', '=', 'roles.id')
            ->where('location_user.location_id', $transfer->to_location_id)
            ->where('roles.level', '<=', 10)
            ->where('location_user.user_id', '!=', $user->id)
            ->pluck('location_user.user_id');

        if ($targetManagerIds->isNotEmpty()) {
            $users = User::whereIn('id', $targetManagerIds)->get();
            foreach ($users as $manager) {
                try {
                    $manager->notify(new StockTransferNotification($transfer, $user->name));
                } catch (\Throwable) {
                }
            }
        }

        return Redirect::route('transactions.index')
            ->with('success', 'Transfer stok berhasil dibuat & menunggu konfirmasi penerima.');
    }

    public function show(StockTransfer $stockTransfer): Response
    {
        $this->authorize('view', $stockTransfer);

        $stockTransfer->load([
            'fromLocation:id,name',
            'toLocation:id,name',
            'user:id,name',
            'receivedBy:id,name',
            'rejectedBy:id,name',
            'stockMovements' => fn($q) =>
            $q->where('type', 'transfer_out')
                ->select('id', 'reference_type', 'reference_id', 'product_id', 'quantity', 'cost_per_unit')
                ->with(['product' => fn($q) => $q->withTrashed()->select('id', 'name', 'sku', 'unit', 'deleted_at')]),
        ]);

        return Inertia::render('Transactions/Transfers/Show', [
            'transfer' => new TransferResource($stockTransfer),
            'can_accept' => Auth::user()->can('accept', $stockTransfer),
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

            $movementsOut = $stockTransfer->stockMovements()
                ->where('type', 'transfer_out')
                ->get();

            foreach ($movementsOut as $movement) {
                $product = Product::withTrashed()->find($movement->product_id);
                $qty = abs($movement->quantity);
                $cost = $movement->cost_per_unit;

                $this->handleStockIn(
                    product: $product,
                    locationId: $stockTransfer->to_location_id,
                    qty: $qty,
                    cost: $cost,
                    type: 'transfer_in',
                    ref: $stockTransfer,
                    notes: $stockTransfer->notes
                );
            }
        });

        try {
            $stockTransfer->user->notify(
                new TransferAcceptedNotification($stockTransfer, $request->user()->name)
            );
        } catch (\Throwable) {
        }

        return back()->with('success', 'Transfer berhasil diterima & stok tujuan ditambahkan.');
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

        DB::transaction(function () use ($stockTransfer, $request, $validated) {
            $stockTransfer->update([
                'status' => 'rejected',
                'rejected_by' => $request->user()->id,
                'rejected_at' => now(),
                'rejection_reason' => $validated['rejection_reason'],
            ]);

            $movementsOut = $stockTransfer->stockMovements()
                ->where('type', 'transfer_out')
                ->get();

            foreach ($movementsOut as $movement) {
                $product = Product::withTrashed()->find($movement->product_id);
                $qty = abs($movement->quantity);
                $cost = $movement->cost_per_unit;

                $this->handleStockIn(
                    product: $product,
                    locationId: $stockTransfer->from_location_id,
                    qty: $qty,
                    cost: $cost,
                    type: 'transfer_in',
                    ref: $stockTransfer,
                    notes: 'Pengembalian Stok (Ditolak): ' . $validated['rejection_reason']
                );
            }
        });

        try {
            $stockTransfer->user->notify(
                new TransferRejectedNotification(
                    $stockTransfer,
                    $request->user()->name,
                    $validated['rejection_reason']
                )
            );
        } catch (\Throwable) {
        }

        return back()->with('success', 'Transfer ditolak dan stok dikembalikan ke lokasi asal.');
    }
}

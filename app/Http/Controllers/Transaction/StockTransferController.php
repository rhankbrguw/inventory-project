<?php

namespace App\Http\Controllers\Transaction;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreStockTransferRequest;
use App\Http\Resources\ProductResource;
use App\Models\Inventory;
use App\Models\Location;
use App\Models\Product;
use App\Models\StockTransfer;
use App\Models\User;
use App\Notifications\StockTransferNotification;
use Illuminate\Http\RedirectResponse;
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

        $sourceLocationsQuery = Location::orderBy('name');
        if ($accessibleLocationIds) {
            $sourceLocationsQuery->whereIn('id', $accessibleLocationIds);
        }
        $sourceLocations = $sourceLocationsQuery->get(['id', 'name']);

        $destinationLocations = Location::orderBy('name')->get(['id', 'name']);

        $productsQuery = Product::with(['inventories' => function ($query) {
            $query->where('quantity', '>', 0);
        }, 'inventories.location'])->orderBy('name');

        if ($accessibleLocationIds) {
            $productsQuery->whereHas('inventories', function ($query) use ($accessibleLocationIds) {
                $query->whereIn('location_id', $accessibleLocationIds)
                    ->where('quantity', '>', 0);
            });
        }

        $products = $productsQuery->get()->map(function ($product) {
            $locations = $product->inventories->map(function ($inv) {
                return [
                    'id' => $inv->location->id,
                    'name' => $inv->location->name,
                    'quantity' => $inv->quantity
                ];
            })->values();

            $product->locations = $locations;
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

        $accessibleLocationIds = $user->getAccessibleLocationIds();
        if ($accessibleLocationIds && !in_array($validated['from_location_id'], $accessibleLocationIds)) {
            abort(403, 'Anda tidak berhak mengambil stok dari lokasi asal ini.');
        }

        $transfer = DB::transaction(function () use ($validated, $request) {
            $transfer = StockTransfer::create([
                'reference_code' => 'TRF-' . now()->format('Ymd-His'),
                'from_location_id' => $validated['from_location_id'],
                'to_location_id' => $validated['to_location_id'],
                'user_id' => $request->user()->id,
                'transfer_date' => now(),
                'notes' => $validated['notes'],
                'status' => 'completed',
            ]);

            foreach ($validated['items'] as $item) {
                $sourceInventory = Inventory::where('product_id', $item['product_id'])
                    ->where('location_id', $validated['from_location_id'])
                    ->firstOrFail();

                $costPerUnit = $sourceInventory->average_cost;

                $transfer->stockMovements()->create([
                    'product_id' => $item['product_id'],
                    'location_id' => $validated['from_location_id'],
                    'type' => 'transfer_out',
                    'quantity' => -abs($item['quantity']),
                    'cost_per_unit' => $costPerUnit,
                    'average_cost_per_unit' => $costPerUnit,
                    'notes' => $validated['notes'],
                ]);

                $transfer->stockMovements()->create([
                    'product_id' => $item['product_id'],
                    'location_id' => $validated['to_location_id'],
                    'type' => 'transfer_in',
                    'quantity' => abs($item['quantity']),
                    'cost_per_unit' => $costPerUnit,
                    'average_cost_per_unit' => $costPerUnit,
                    'notes' => $validated['notes'],
                ]);

                $sourceInventory->decrement('quantity', $item['quantity']);

                $destinationInventory = Inventory::firstOrNew([
                    'product_id' => $item['product_id'],
                    'location_id' => $validated['to_location_id'],
                ]);

                $oldQty = $destinationInventory->quantity ?? 0;
                $oldAvgCost = $destinationInventory->average_cost ?? 0;
                $newQty = abs($item['quantity']);
                $totalQty = $oldQty + $newQty;
                $newAvgCost = $totalQty > 0 ? (($oldQty * $oldAvgCost) + ($newQty * $costPerUnit)) / $totalQty : 0;

                $destinationInventory->quantity = $totalQty;
                $destinationInventory->average_cost = $newAvgCost;
                $destinationInventory->save();
            }
            return $transfer;
        });

        try {
            $targetManagers = User::whereHas('locations', function ($q) use ($transfer) {
                $q->where('locations.id', $transfer->to_location_id)
                    ->whereIn('location_user.role_id', function ($sub) {
                        $sub->select('id')->from('roles')->whereIn('code', ['WHM', 'BRM']);
                    });
            })->get();

            if ($targetManagers->count() > 0) {
                foreach ($targetManagers as $manager) {
                    try {
                        $manager->notify(new StockTransferNotification($transfer, $request->user()->name));
                    } catch (\Exception) {
                    }
                }
            }
        } catch (\Exception) {
        }

        return Redirect::route('stock-movements.index')
            ->with('success', 'Transfer stok berhasil dicatat.');
    }
}

<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreStockTransferRequest;
use App\Http\Resources\ProductResource;
use App\Models\Inventory;
use App\Models\Location;
use App\Models\Product;
use App\Models\StockTransfer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;
use Inertia\Response;

class StockTransferController extends Controller
{
    public function create(): Response
    {
        return inertia('StockMovements/Create', [
            'locations' => Location::orderBy('name')->get(['id', 'name']),
            'products' => ProductResource::collection(
                Product::with('locations:id')->orderBy('name')->get()
            ),
        ]);
    }

    public function store(StoreStockTransferRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        DB::transaction(function () use ($validated, $request) {
            $transfer = StockTransfer::create([
                'reference_code' => 'TRF-' . now()->format('Ymd-His'),
                'from_location_id' => $validated['from_location_id'],
                'to_location_id' => $validated['to_location_id'],
                'user_id' => $request->user()->id,
                'transfer_date' => Carbon::parse($validated['transfer_date'])->format('Y-m-d'),
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
                    'notes' => $validated['notes'],
                ]);

                $transfer->stockMovements()->create([
                    'product_id' => $item['product_id'],
                    'location_id' => $validated['to_location_id'],
                    'type' => 'transfer_in',
                    'quantity' => abs($item['quantity']),
                    'cost_per_unit' => $costPerUnit,
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
        });

        return redirect()
            ->route('stock-movements.index')
            ->with('success', 'Transfer stok berhasil dicatat.');
    }
}

<?php

namespace App\Traits;

use App\Models\Inventory;
use App\Models\StockMovement;
use Illuminate\Database\Eloquent\Model;

trait ManagesStock
{
    protected function handleStockIn(Model $product, int $locationId, float $qty, float $cost, string $type, Model $ref, ?string $notes = null)
    {
        $inventory = Inventory::lockForUpdate()->firstOrCreate(
            ['product_id' => $product->id, 'location_id' => $locationId],
            ['quantity' => 0, 'average_cost' => 0]
        );

        $currentVal = $inventory->quantity * $inventory->average_cost;
        $incomingVal = $qty * $cost;
        $totalQty = $inventory->quantity + $qty;

        $newAvgCost = $totalQty > 0 ? ($currentVal + $incomingVal) / $totalQty : $inventory->average_cost;

        $inventory->update([
            'quantity' => $totalQty,
            'average_cost' => $newAvgCost
        ]);

        return StockMovement::create([
            'product_id' => $product->id,
            'location_id' => $locationId,
            'type' => $type,
            'quantity' => $qty,
            'cost_per_unit' => $cost,
            'average_cost_per_unit' => $newAvgCost,
            'reference_type' => get_class($ref),
            'reference_id' => $ref->id,
            'notes' => $notes
        ]);
    }

    protected function handleStockOut(Model $product, int $locationId, float $qty, float $sellPrice, string $type, Model $ref, ?string $notes = null)
    {
        $inventory = Inventory::lockForUpdate()
            ->where('product_id', $product->id)
            ->where('location_id', $locationId)
            ->firstOrFail();

        if ($inventory->quantity < $qty) {
            throw new \Exception("Stok {$product->name} tidak mencukupi. Sisa: {$inventory->quantity}");
        }

        $inventory->decrement('quantity', $qty);

        return StockMovement::create([
            'product_id' => $product->id,
            'location_id' => $locationId,
            'type' => $type,
            'quantity' => -abs($qty),
            'cost_per_unit' => $sellPrice,
            'average_cost_per_unit' => $inventory->average_cost,
            'reference_type' => get_class($ref),
            'reference_id' => $ref->id,
            'notes' => $notes
        ]);
    }
}

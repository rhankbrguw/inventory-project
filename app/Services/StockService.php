<?php

namespace App\Services;

use App\Exceptions\InsufficientStockException;
use App\Models\Inventory;
use App\Models\StockMovement;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class StockService
{
    public function stockIn(Model $product, int $locationId, float $qty, float $cost, string $type, Model $ref, ?string $notes = null, ?int $channelId = null): StockMovement
    {
        $this->ensureInventoryExists($product->id, $locationId);

        $inventory = Inventory::where('product_id', $product->id)->where('location_id', $locationId)->lockForUpdate()->first();
        $totalQty = $inventory->quantity + $qty;
        $newAvgCost = $totalQty > 0 ? (($inventory->quantity * $inventory->average_cost) + ($qty * $cost)) / $totalQty : $inventory->average_cost;

        $inventory->update(['quantity' => $totalQty, 'average_cost' => $newAvgCost]);

        return $this->createMovementRecord($product->id, $locationId, $type, $qty, $cost, $newAvgCost, $ref, $notes, $channelId);
    }

    private function ensureInventoryExists(int $productId, int $locationId): void
    {
        DB::table('inventories')->insertOrIgnore([
            'product_id' => $productId, 'location_id' => $locationId, 'quantity' => 0, 'average_cost' => 0,
            'created_at' => now(), 'updated_at' => now(),
        ]);
    }

    public function stockOut(Model $product, int $locationId, float $qty, float $sellPrice, string $type, Model $ref, ?string $notes = null, ?int $channelId = null): StockMovement
    {
        $inventory = Inventory::where('product_id', $product->id)->where('location_id', $locationId)->firstOrFail();
        $affected = Inventory::where('product_id', $product->id)->where('location_id', $locationId)->where('quantity', '>=', $qty)->decrement('quantity', $qty);

        if ($affected === 0) {
            throw new InsufficientStockException($product->name, '', (string) $inventory->quantity);
        }

        return $this->createMovementRecord($product->id, $locationId, $type, -abs($qty), $sellPrice, $inventory->average_cost, $ref, $notes, $channelId);
    }

    private function createMovementRecord(int $productId, int $locationId, string $type, float $qty, float $cost, float $avgCost, Model $ref, ?string $notes, ?int $channelId): StockMovement
    {
        $userId = auth()->id() ?? ($ref->user_id ?? null);

        return StockMovement::create([
            'product_id' => $productId, 'location_id' => $locationId, 'user_id' => $userId,
            'type' => $type, 'quantity' => $qty, 'cost_per_unit' => $cost, 'average_cost_per_unit' => $avgCost,
            'reference_type' => get_class($ref), 'reference_id' => $ref->id,
            'date' => now()->toDateString(), 'notes' => $notes, 'sales_channel_type_id' => $channelId,
        ]);
    }

    public function recalculateGlobalAverageCost(Model $product, float $incomingQty, float $incomingCost): void
    {
        $globalStats = Inventory::where('product_id', $product->id)->selectRaw('SUM(quantity) as total_qty, SUM(quantity * average_cost) as total_value')->first();
        $currentGlobalStock = (float) ($globalStats->total_qty ?? 0);
        $currentGlobalValue = (float) ($globalStats->total_value ?? 0);
        $totalQty = $currentGlobalStock + $incomingQty;

        if ($totalQty > 0) {
            $newAvgCost = ($currentGlobalValue + ($incomingQty * $incomingCost)) / $totalQty;
            $product->update(['average_cost' => $newAvgCost]);
        }
    }

    public function getInventoryMovements(Inventory $inventory, int $perPage = 20): \Illuminate\Contracts\Pagination\LengthAwarePaginator
    {
        return StockMovement::where('product_id', $inventory->product_id)
            ->where('location_id', $inventory->location_id)
            ->with([
                'product', 'location',
                'reference' => fn (\Illuminate\Database\Eloquent\Relations\MorphTo $morph) => $morph->morphWith([
                    \App\Models\Purchase::class => ['supplier', 'fromLocation'],
                    \App\Models\Sell::class => ['customer', 'targetLocation'],
                    \App\Models\StockTransfer::class => ['fromLocation', 'toLocation'],
                    User::class => [],
                ]),
            ])
            ->latest('created_at')
            ->paginate($perPage);
    }

    public function getInventoryQuantity(int $productId, int $locationId): float
    {
        $inventory = Inventory::where('product_id', $productId)->where('location_id', $locationId)->first();

        return (float) ($inventory->quantity ?? 0);
    }
}

<?php

namespace App\Services;

use App\Models\Inventory;
use App\Models\Product;
use App\Models\StockMovement;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class StockAdjustmentService
{
    public function adjust(array $validated, User $user): void
    {
        DB::transaction(function () use ($validated, $user) {
            Product::findOrFail($validated['product_id']);
            $this->ensureInventoryExists($validated['product_id'], $validated['location_id']);

            $inventory = Inventory::where('product_id', $validated['product_id'])->where('location_id', $validated['location_id'])->lockForUpdate()->first();
            $currQty = (float) $inventory->quantity;
            $mode = $validated['mode'] ?? 'absolute';
            $inputQty = (float) $validated['quantity'];

            $newQty = match ($mode) {
                'reduction' => max(0.0, $currQty - $inputQty),
                'addition' => $currQty + $inputQty,
                default => $inputQty,
            };
            $diff = $newQty - $currQty;

            if ($diff != 0) {
                $inventory->update(['quantity' => $newQty]);
                $this->createAdjustmentMovement($validated, $user, $diff, $currQty, $newQty, (float) $inventory->average_cost);
            }
        });
    }

    private function ensureInventoryExists(int $productId, int $locationId): void
    {
        DB::table('inventories')->insertOrIgnore([
            'product_id' => $productId, 'location_id' => $locationId, 'quantity' => 0, 'average_cost' => 0,
            'created_at' => now(), 'updated_at' => now(),
        ]);
    }

    private function createAdjustmentMovement(array $adjustmentData, User $user, float $diff, float $curr, float $new, float $avgCost): void
    {
        $mode = $adjustmentData['mode'] ?? 'absolute';
        $modeLabel = match ($mode) {
            'reduction' => 'Rusak/Kurang',
            'addition' => 'Tambah',
            default => 'Opname',
        };
        StockMovement::create([
            'product_id' => $adjustmentData['product_id'], 'location_id' => $adjustmentData['location_id'], 'type' => StockMovement::TYPE_ADJUSTMENT,
            'quantity' => $diff, 'cost_per_unit' => $avgCost, 'average_cost_per_unit' => $avgCost,
            'reference_type' => User::class, 'reference_id' => $user->id, 'notes' => $adjustmentData['notes']." ({$modeLabel}: {$curr} -> {$new})", 'user_id' => $user->id,
        ]);
    }
}

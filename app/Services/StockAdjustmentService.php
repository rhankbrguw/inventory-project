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
            $product = Product::findOrFail($validated['product_id']);
            $this->ensureInventoryExists($product, (int) $validated['location_id']);

            $inventory = Inventory::where('product_id', $product->id)
                ->where('location_id', $validated['location_id'])
                ->lockForUpdate()
                ->firstOrFail();

            $currQty = (float) $inventory->quantity;
            $mode = $validated['mode'] ?? 'absolute';
            $inputQty = (float) $validated['quantity'];

            $newQty = $this->calculateAndValidateNewQuantity($mode, $currQty, $inputQty);
            $diff = $newQty - $currQty;

            if ($diff != 0) {
                $avgCost = (float) $inventory->average_cost > 0 ? (float) $inventory->average_cost : (float) $product->price;
                $inventory->update([
                    'quantity' => $newQty,
                    'average_cost' => $avgCost,
                ]);
                $this->createAdjustmentMovement($validated, $user, $diff, $currQty, $newQty, $avgCost);
            }
        });
    }

    private function calculateAndValidateNewQuantity(string $mode, float $curr, float $input): float
    {
        if ($mode === 'reduction') {
            if ($curr <= 0) {
                throw new \InvalidArgumentException(__('messages.stock.cannot_reduce_zero_stock'));
            }
            if ($input <= 0) {
                throw new \InvalidArgumentException(__('messages.stock.quantity_must_be_positive'));
            }
            if ($input > $curr) {
                throw new \InvalidArgumentException(__('messages.stock.cannot_reduce_exceeding_stock', ['available' => $curr]));
            }

            return $curr - $input;
        }

        if ($mode === 'addition') {
            if ($input <= 0) {
                throw new \InvalidArgumentException(__('messages.stock.quantity_must_be_positive'));
            }

            return $curr + $input;
        }

        if ($input < 0) {
            throw new \InvalidArgumentException(__('messages.stock.quantity_must_be_positive'));
        }

        return $input;
    }

    private function ensureInventoryExists(Product $product, int $locationId): void
    {
        $cost = (float) $product->price > 0 ? (float) $product->price : 0;
        DB::table('inventories')->insertOrIgnore([
            'product_id' => $product->id,
            'location_id' => $locationId,
            'quantity' => 0,
            'average_cost' => $cost,
            'created_at' => now(),
            'updated_at' => now(),
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
            'product_id' => $adjustmentData['product_id'],
            'location_id' => $adjustmentData['location_id'],
            'type' => StockMovement::TYPE_ADJUSTMENT,
            'quantity' => $diff,
            'cost_per_unit' => $avgCost,
            'average_cost_per_unit' => $avgCost,
            'reference_type' => User::class,
            'reference_id' => $user->id,
            'notes' => $adjustmentData['notes']." ({$modeLabel}: {$curr} -> {$new})",
            'user_id' => $user->id,
        ]);
    }
}

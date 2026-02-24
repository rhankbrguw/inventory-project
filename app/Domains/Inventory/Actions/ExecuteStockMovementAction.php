<?php

namespace App\Domains\Inventory\Actions;

use App\Domains\Inventory\DataTransferObjects\StockMovementData;
use App\Models\Inventory;
use App\Models\StockMovement;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Exception;

class ExecuteStockMovementAction
{
    /**
     * Executes a stock movement with atomic locking and transaction safety.
     *
     * @param StockMovementData $data
     * @return StockMovement
     * @throws Exception
     */
    public function execute(StockMovementData $data): StockMovement
    {
        $lockKey = "inventory_lock_{$data->location_id}_{$data->product_id}";

        // Block for up to 10 seconds to acquire the lock
        $lock = Cache::lock($lockKey, 10);

        if (!$lock->block(10)) {
            throw new Exception("Unable to acquire lock for inventory modification.");
        }

        try {
            return DB::transaction(function () use ($data) {
                $inventory = Inventory::firstOrCreate(
                    ['product_id' => $data->product_id, 'location_id' => $data->location_id],
                    ['quantity' => '0', 'average_cost' => '0']
                );

                $currentQty = (string) $inventory->quantity;
                $currentAvgCost = (string) $inventory->average_cost;
                $movementQty = $data->quantity;

                // Determine if it's an additive movement or subtractive using the Enum helper method
                $isAdditive = $data->type->isAdditive();

                if (!$isAdditive) {
                    $absMovementQty = ltrim($movementQty, '-');

                    // Check if sufficient stock exists
                    if (bccomp($currentQty, $absMovementQty, 4) < 0) {
                        throw new Exception("Insufficient stock. Required: {$absMovementQty}, Available: {$currentQty}");
                    }

                    $newQty = bcsub($currentQty, $absMovementQty, 4);
                    // Average cost generally doesn't change on outward movements
                    $newAvgCost = $currentAvgCost;

                    // Stock movement quantity is recorded as negative for outward movements
                    $recordQty = '-' . $absMovementQty;

                } else { // It's an additive movement (IN, ADJUSTMENT)
                    $newQty = bcadd($currentQty, $movementQty, 4);

                    // Calculate new moving average cost if there's an incoming cost and new quantity is > 0
                    if ($data->type === \App\Domains\Inventory\Enums\MovementType::IN && $data->unit_cost !== null && bccomp($newQty, '0', 4) > 0) {
                        $currentValue = bcmul($currentQty, $currentAvgCost, 6);
                        $incomingValue = bcmul($movementQty, $data->unit_cost, 6);
                        $totalValue = bcadd($currentValue, $incomingValue, 6);

                        $newAvgCost = bcdiv($totalValue, $newQty, 4);
                    } else {
                        $newAvgCost = $currentAvgCost;
                    }

                    $recordQty = $movementQty;
                }

                $inventory->update([
                    'quantity' => $newQty,
                    'average_cost' => $newAvgCost,
                ]);

                return StockMovement::create([
                    'product_id' => $data->product_id,
                    'location_id' => $data->location_id,
                    'type' => $data->type->value,
                    'quantity' => $recordQty,
                    'cost_per_unit' => $data->unit_cost,
                    'average_cost_per_unit' => $newAvgCost,
                    'reference_type' => $data->reference_type,
                    'reference_id' => $data->reference_id,
                    'notes' => $data->notes,
                    'sales_channel_type_id' => $data->sales_channel_type_id,
                    'user_id' => $data->user_id,
                ]);
            });
        } finally {
            $lock->release();
        }
    }
}

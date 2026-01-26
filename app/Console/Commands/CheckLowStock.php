<?php

namespace App\Console\Commands;

use App\Models\Inventory;
use App\Models\Role;
use App\Models\StockMovement;
use App\Notifications\LowStockAlertNotification;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CheckLowStock extends Command
{
    protected $signature = 'inventory:check-low-stock';
    protected $description = 'Cek stok menipis (Optimized with Heuristic AI)';

    public function handle()
    {
        $this->info('Running Check low Stock...');

        $salesLast7Days = StockMovement::where('type', 'sell')
            ->where('created_at', '>=', now()->subDays(7))
            ->get();

        Inventory::with(['product', 'location.users' => function ($q) {
            $q->whereHas('roles', fn($r) => $r->where('level', '<=', Role::THRESHOLD_MANAGERIAL));
        }])->chunk(100, function ($inventories) use ($salesLast7Days) {

            foreach ($inventories as $inventory) {
                $totalSold = $salesLast7Days->where('product_id', $inventory->product_id)
                    ->where('location_id', $inventory->location_id)
                    ->sum('quantity');

                $avgDailySales = $totalSold / 7;

                $dynamicThreshold = $avgDailySales > 0 ? ceil($avgDailySales * 3) : 10;

                if ($inventory->quantity <= $dynamicThreshold) {
                    $location = $inventory->location;
                    if (!$location || $location->users->isEmpty()) {
                        continue;
                    }

                    foreach ($location->users as $manager) {
                        try {
                            $manager->notify((new LowStockAlertNotification(
                                collect([$inventory]),
                                $location->name
                            ))->delay(now()->addSeconds(2)));

                            $this->info("Alert sent for {$inventory->product->name}");
                        } catch (\Exception $e) {
                            Log::error("Err Notif AI: " . $e->getMessage());
                        }
                    }
                }
            }
        });

        $this->info('Check low Stock done.');
    }
}

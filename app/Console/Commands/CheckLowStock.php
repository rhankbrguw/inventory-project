<?php

namespace App\Console\Commands;

use App\Models\Inventory;
use App\Models\Role;
use App\Notifications\LowStockAlertNotification;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CheckLowStock extends Command
{
    protected $signature = 'inventory:check-low-stock';
    protected $description = 'Cek stok menipis (Optimized)';

    public function handle()
    {
        $this->info('Start checking...');

        Inventory::query()
            ->where('quantity', '<', 20)
            ->with(['product', 'location.users' => function ($q) {
                $q->whereHas('roles', fn($r) => $r->where('level', '<=', Role::THRESHOLD_MANAGERIAL));
            }])
            ->chunk(100, function ($inventories) {
                foreach ($inventories->groupBy('location_id') as $items) {
                    $location = $items->first()->location;

                    if (!$location || $location->users->isEmpty()) {
                        continue;
                    }

                    foreach ($location->users as $manager) {
                        try {
                            $manager->notify((new LowStockAlertNotification($items, $location->name))
                                ->delay(now()->addSeconds(5)));
                        } catch (\Exception $e) {
                            Log::error("Err Notif: " . $e->getMessage());
                        }
                    }
                }
            });

        $this->info('Done.');
    }
}

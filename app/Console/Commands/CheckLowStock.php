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

    protected $description = 'Check low stock with heuristic calculation';

    public function handle(): void
    {
        $this->info('Running Check low Stock...');
        $salesLast7Days = StockMovement::where('type', 'sell')->where('created_at', '>=', now()->subDays(7))->get();

        Inventory::with(['product', 'location.users' => fn ($q) => $q->whereHas('roles', fn ($r) => $r->where('level', '<=', Role::THRESHOLD_MANAGERIAL))])
            ->chunk(100, fn ($chunk) => $this->processChunk($chunk, $salesLast7Days));

        $this->info('Check low Stock done.');
    }

    private function processChunk(\Illuminate\Support\Collection $inventories, \Illuminate\Support\Collection $sales): void
    {
        foreach ($inventories as $inventory) {
            $totalSold = $sales->where('product_id', $inventory->product_id)->where('location_id', $inventory->location_id)->sum('quantity');
            $avgDailySales = $totalSold / 7;
            $threshold = $avgDailySales > 0 ? ceil($avgDailySales * 3) : 10;

            if ($inventory->quantity <= $threshold) {
                $this->notifyManagers($inventory);
            }
        }
    }

    private function notifyManagers(Inventory $inventory): void
    {
        $location = $inventory->location;
        if (! $location || $location->users->isEmpty()) {
            return;
        }

        foreach ($location->users as $manager) {
            try {
                $manager->notify((new LowStockAlertNotification(collect([$inventory]), $location->name))->delay(now()->addSeconds(2)));
                $this->info("Alert sent for {$inventory->product->name}");
            } catch (\Exception $e) {
                Log::error('Err Notif AI: '.$e->getMessage());
            }
        }
    }
}

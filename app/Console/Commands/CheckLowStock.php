<?php

namespace App\Console\Commands;

use App\Models\Inventory;
use App\Models\Location;
use App\Models\User;
use App\Notifications\LowStockAlertNotification;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CheckLowStock extends Command
{
    protected $signature = 'inventory:check-low-stock';
    protected $description = 'Cek stok menipis di setiap lokasi dan notifikasi manager';

    public function handle()
    {
        $this->info('Memulai pengecekan stok...');

        $locations = Location::all();

        foreach ($locations as $location) {
            $lowStockItems = Inventory::where('location_id', $location->id)
                ->where('quantity', '<', 20)
                ->with('product')
                ->get();

            if ($lowStockItems->isEmpty()) {
                continue;
            }

            $this->info("Ditemukan {$lowStockItems->count()} item menipis di {$location->name}");

            $managers = User::whereHas('locations', function ($q) use ($location) {
                $q->where('locations.id', $location->id)
                    ->whereIn('location_user.role_id', function ($sub) {
                        $sub->select('id')->from('roles')->whereIn('code', ['WHM', 'BRM']);
                    });
            })->get();

            foreach ($managers as $manager) {
                try {
                    $manager->notify(new LowStockAlertNotification($lowStockItems, $location->name));
                    $this->info("Notif dikirim ke: {$manager->name}");
                } catch (\Exception $e) {
                    Log::error("Gagal kirim Alert ke {$manager->name}: " . $e->getMessage());
                }
            }
        }

        $this->info('Pengecekan selesai.');
    }
}

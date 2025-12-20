<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;
use App\Notifications\Channels\FonnteChannel;
use Illuminate\Support\Collection;

class LowStockAlertNotification extends Notification
{
    use Queueable;

    public function __construct(
        public Collection $lowStockItems,
        public string $locationName
    ) {}

    public function via(object $notifiable): array
    {
        $channels = ['database', 'broadcast'];
        if ($notifiable->phone) {
            $channels[] = FonnteChannel::class;
        }
        return $channels;
    }

    public function toArray(): array
    {
        return [
            'title' => '⚠️ Low Stock Alert',
            'message' => "{$this->lowStockItems->count()} item menipis di {$this->locationName}.",
            'action_url' => route('stock.index'),
            'sender' => 'System',
            'icon' => 'AlertTriangle',
            'type' => 'warning',
            'created_at' => now(),
        ];
    }

    public function toBroadcast(): BroadcastMessage
    {
        return new BroadcastMessage([
            'id' => $this->id,
            'type' => get_class($this),
            'data' => $this->toArray(),
            'read_at' => null,
            'created_at' => now()->toISOString(),
        ]);
    }

    public function toFonnte(object $notifiable): string
    {
        $timezone = config('app.timezone');
        $date = now()->setTimezone($timezone)->format('d/m/Y H:i');

        $limit = 10;
        $shownItems = $this->lowStockItems->take($limit);
        $remaining = $this->lowStockItems->count() - $limit;

        $itemsList = $shownItems->map(function ($item) {
            $qty = number_format($item->quantity, 0, ',', '.');

            return "- {$item->product->name} ({$item->product->sku})\n  Sisa: {$qty} {$item->product->unit}";
        })->join("\n");

        if ($remaining > 0) {
            $itemsList .= "\n... dan {$remaining} item lainnya.";
        }

        return "*LOW STOCK ALERT* ⚠️\n\n"
            . "Halo {$notifiable->name},\n\n"
            . "Laporan stok menipis \n🗓️ Per: {$date}\n"
            . "📍 Lokasi: *{$this->locationName}*\n\n"
            . "*Daftar Barang:*\n"
            . "{$itemsList}\n\n"
            . "Mohon segera lakukan restock/pembelian.\n"
            . "*Akses Sistem*:\n "
            . route('stock.index');
    }
}

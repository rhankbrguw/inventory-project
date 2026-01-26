<?php

namespace App\Notifications;

use App\Notifications\Channels\FonnteChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class LowStockAlertNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public $lowStockItems,
        public $locationName
    ) {}

    public function via(object $notifiable): array
    {
        $channels = ['broadcast', 'database'];
        if ($notifiable->phone) {
            $channels[] = FonnteChannel::class;
        }
        return $channels;
    }

    public function toArray(object $notifiable): array
    {
        $isIndonesian = $this->getUserLocale($notifiable) === 'id';

        return [
            'title' => $isIndonesian ? '⚠️ Peringatan Stok Rendah' : '⚠️ Low Stock Alert',
            'message' => $isIndonesian
                ? "{$this->lowStockItems->count()} item di bawah batas minimum di {$this->locationName}."
                : "{$this->lowStockItems->count()} item(s) below minimum threshold at {$this->locationName}.",
            'action_url' => route('stock.index'),
            'sender' => $isIndonesian ? 'Sistem Otomatis' : 'System Automation',
            'icon' => 'AlertTriangle',
            'type' => 'warning',
            'created_at' => now(),
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'id' => $this->id,
            'type' => get_class($this),
            'data' => $this->toArray($notifiable),
            'read_at' => null,
            'created_at' => now()->toISOString(),
        ]);
    }

    public function toFonnte(object $notifiable): string
    {
        $isIndonesian = $this->getUserLocale($notifiable) === 'id';
        $date = now()->format('d/m/Y H:i');
        $limit = 10;

        $items = $this->lowStockItems->take($limit)->map(function ($item) {
            $quantity = rtrim(rtrim(number_format($item->quantity, 2, '.', ''), '0'), '.');
            return "• {$item->product->name} ({$item->product->sku}): *{$quantity} {$item->product->unit}*";
        })->join("\n");

        $remaining = $this->lowStockItems->count() - $limit;
        if ($remaining > 0) {
            $moreText = $isIndonesian ? "dan {$remaining} item lainnya" : "and {$remaining} more";
            $items .= "\n_{$moreText}_";
        }

        if ($isIndonesian) {
            $labelLokasi = str_pad("Lokasi", 9);
            $labelTotal = str_pad("Total SKU", 9);
            $labelTanggal = str_pad("Tanggal", 9);

            return "*PERINGATAN STOK KRITIS* ⚠️\n\n"
                . "Halo {$notifiable->name},\n\n"
                . "Terdapat item dengan stok di bawah batas minimum:\n"
                . "```"
                . "{$labelLokasi}: {$this->locationName}\n"
                . "{$labelTotal}: {$this->lowStockItems->count()} Item\n"
                . "{$labelTanggal}: {$date}"
                . "```\n\n"
                . "*Detail Item:*\n"
                . "{$items}\n\n"
                . "*Akses Sistem:*\n"
                . route('stock.index');
        } else {
            $labelLocation = str_pad("Location", 9);
            $labelTotal = str_pad("Total SKU", 9);
            $labelDate = str_pad("Date", 9);

            return "*CRITICAL STOCK ALERT* ⚠️\n\n"
                . "Hello {$notifiable->name},\n\n"
                . "Items below minimum threshold detected:\n"
                . "```"
                . "{$labelLocation}: {$this->locationName}\n"
                . "{$labelTotal}: {$this->lowStockItems->count()} Items\n"
                . "{$labelDate}: {$date}"
                . "```\n\n"
                . "*Item Details:*\n"
                . "{$items}\n\n"
                . "*System Access:*\n"
                . route('stock.index');
        }
    }

    private function getUserLocale(object $notifiable): string
    {
        return $notifiable->locale ?? config('app.locale', 'id');
    }
}

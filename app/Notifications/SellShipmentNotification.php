<?php

namespace App\Notifications;

use App\Notifications\Channels\FonnteChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class SellShipmentNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public $sell,
        public $senderName
    ) {
    }

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
            'title' => $isIndonesian ? '🚚 Pesanan Dikirim' : '🚚 Order Shipped',
            'message' => $isIndonesian
                ? "Pesanan {$this->sell->reference_code} sedang dikirim dari {$this->sell->location->name}"
                : "Order {$this->sell->reference_code} is being shipped from {$this->sell->location->name}",
            'action_url' => route('transactions.sells.show', $this->sell->id),
            'icon' => 'Truck',
            'type' => 'info',
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

        $items = $this->sell->stockMovements()
            ->where('type', 'sell')
            ->with('product')
            ->get();

        $totalItems = $items->count();
        $totalQty = $items->sum(fn ($i) => abs($i->quantity));

        $itemsList = $items->take(5)->map(function ($item) {
            return "• {$item->product->name}: " . abs($item->quantity) . " {$item->product->unit}";
        })->join("\n");

        if ($items->count() > 5) {
            $moreText = $isIndonesian ? "dan " . ($items->count() - 5) . " item lainnya" : "and " . ($items->count() - 5) . " more";
            $itemsList .= "\n_{$moreText}_";
        }

        if ($isIndonesian) {
            $labelTanggal = str_pad("Tanggal", 9);
            $labelAsal = str_pad("Asal", 9);
            $labelOleh = str_pad("Oleh", 9);
            $labelRef = str_pad("Ref", 9);
            $labelTotal = str_pad("Total", 9);

            return "*PESANAN DIKIRIM* 🚚\n\n"
                . "Halo {$notifiable->name},\n\n"
                . "Pesanan stok Anda sedang dalam pengiriman:\n"
                . "```"
                . "{$labelTanggal}: {$date}\n"
                . "{$labelAsal}: {$this->sell->location->name}\n"
                . "{$labelOleh}: {$this->senderName}\n"
                . "{$labelRef}: {$this->sell->reference_code}\n"
                . "{$labelTotal}: {$totalItems} SKU / {$totalQty} Unit"
                . "```\n\n"
                . "*Detail Barang:*\n"
                . "{$itemsList}\n\n"
                . "*Mohon konfirmasi penerimaan di sistem:*\n"
                . route('transactions.sells.show', $this->sell->id);
        } else {
            $labelDate = str_pad("Date", 9);
            $labelOrigin = str_pad("Origin", 9);
            $labelBy = str_pad("By", 9);
            $labelRef = str_pad("Ref", 9);
            $labelTotal = str_pad("Total", 9);

            return "*ORDER SHIPPED* 🚚\n\n"
                . "Hello {$notifiable->name},\n\n"
                . "Your stock order is being shipped:\n"
                . "```"
                . "{$labelDate}: {$date}\n"
                . "{$labelOrigin}: {$this->sell->location->name}\n"
                . "{$labelBy}: {$this->senderName}\n"
                . "{$labelRef}: {$this->sell->reference_code}\n"
                . "{$labelTotal}: {$totalItems} SKU / {$totalQty} Units"
                . "```\n\n"
                . "*Item Details:*\n"
                . "{$itemsList}\n\n"
                . "*Please confirm receipt in system:*\n"
                . route('transactions.sells.show', $this->sell->id);
        }
    }

    private function getUserLocale(object $notifiable): string
    {
        return $notifiable->locale ?? config('app.locale', 'id');
    }
}

<?php

namespace App\Notifications;

use App\Notifications\Channels\FonnteChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class PurchaseShipmentNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public $purchase,
        public $senderName
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
        $isIndonesian = ($notifiable->locale ?? 'id') === 'id';

        return [
            'title' => $isIndonesian ? '🚚 Stok Dikirim' : '🚚 Stock Shipped',
            'message' => $isIndonesian
                ? "Permintaan stok {$this->purchase->reference_code} sedang dikirim dari Gudang."
                : "Stock request {$this->purchase->reference_code} is being shipped from Warehouse.",
            'action_url' => route('transactions.purchases.show', $this->purchase->id),
            'icon' => 'Truck',
            'type' => 'info',
            'created_at' => now(),
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'id' => $this->id,
            'type' => static::class,
            'data' => $this->toArray($notifiable),
            'read_at' => null,
            'created_at' => now()->toISOString(),
        ]);
    }

    public function toFonnte(object $notifiable): string
    {
        now()->format('d/m/Y H:i');

        $items = $this->purchase->items()->with('product')->get();
        $totalQty = $items->sum('quantity');

        $itemsList = $items->take(5)->map(
            fn($item) =>
            "• {$item->product->name}: " . number_format($item->quantity, 0) . " {$item->product->unit}"
        )->join("\n");

        if ($items->count() > 5) {
            $itemsList .= "\n_dan " . ($items->count() - 5) . " item lainnya_";
        }

        $labelRef = str_pad('Ref', 9);
        $labelAsal = str_pad('Asal', 9);
        $labelOleh = str_pad('Pengirim', 9);
        $labelTotal = str_pad('Total', 9);

        return "*STOK SEDANG DIKIRIM* 🚚\n\n"
            . "Halo {$notifiable->name},\n\n"
            . "Barang permintaan Anda sedang dalam perjalanan:\n"
            . "```"
            . "{$labelRef}: {$this->purchase->reference_code}\n"
            . "{$labelAsal}: " . ($this->purchase->fromLocation->name ?? 'Gudang Pusat') . "\n"
            . "{$labelOleh}: {$this->senderName}\n"
            . "{$labelTotal}: {$totalQty} Unit"
            . "```\n\n"
            . "*Detail Barang:*\n"
            . "{$itemsList}\n\n"
            . "*Mohon konfirmasi penerimaan di sistem saat barang tiba.*\n"
            . route('transactions.purchases.show', $this->purchase->id);
    }
}

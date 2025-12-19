<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;
use App\Models\StockTransfer;
use App\Notifications\Channels\FonnteChannel;

class StockTransferNotification extends Notification
{
    use Queueable;

    public function __construct(
        public StockTransfer $transfer,
        public string $senderName
    ) {
    }

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
            'title' => '📦 Stok Masuk Baru',
            'message' => "Kiriman dari {$this->transfer->fromLocation->name} (Ref: {$this->transfer->reference_code})",
            'action_url' => route('stock-movements.index'),
            'sender' => $this->senderName,
            'icon' => 'Truck',
            'type' => 'info',
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
        $fromLocation = $this->transfer->fromLocation->name;
        $referenceCode = $this->transfer->reference_code;
        $date = now()->format('d/m/Y H:i');

        $items = $this->transfer->stockMovements()
            ->where('type', 'transfer_in')
            ->with('product')
            ->get();

        $itemsList = $items->map(function ($item) {
            return "• {$item->product->name}: " . abs($item->quantity) . " {$item->product->unit}";
        })->join("\n");

        $labelTgl  = str_pad("Tanggal", 9);
        $labelAsal = str_pad("Asal", 9);
        $labelOleh = str_pad("Oleh", 9);
        $labelRef  = str_pad("Ref", 9);

        return "*INCOMING STOCK ALERT* 📦\n\n"
            . "Halo {$notifiable->name},\n\n"
            . "Stok masuk baru telah tercatat:\n"
            . "```"
            . "{$labelTgl}: {$date}\n"
            . "{$labelAsal}: {$fromLocation}\n"
            . "{$labelOleh}: {$this->senderName}\n"
            . "{$labelRef}: {$referenceCode}"
            . "```\n\n"
            . "*Detail Barang:*\n"
            . "{$itemsList}\n\n"
            . "*Akses Sistem:*\n"
            . route('stock-movements.index');
    }
}

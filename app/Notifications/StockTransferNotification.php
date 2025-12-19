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
            'data' => [
                'title' => '📦 Stok Masuk Baru',
                'message' => "Kiriman dari {$this->transfer->fromLocation->name} (Ref: {$this->transfer->reference_code})",
                'action_url' => route('stock-movements.index'),
                'sender' => $this->senderName,
                'icon' => 'Truck',
                'type' => 'info',
            ],
            'read_at' => null,
            'created_at' => now()->toISOString(),
        ]);
    }

    public function toFonnte(object $notifiable): string
    {
        $fromLocation = $this->transfer->fromLocation->name;
        $toLocation = $this->transfer->toLocation->name;
        $referenceCode = $this->transfer->reference_code;

        $items = $this->transfer->stockMovements()
            ->where('type', 'transfer_in')
            ->with('product')
            ->get();

        $itemsList = $items->map(function ($item) {
            return "• {$item->product->name}: " . abs($item->quantity) . " {$item->product->unit}";
        })->join("\n");

        return "📦 *STOK MASUK BARU*\n\n"
            . "Halo {$notifiable->name},\n\n"
            . "Ada transfer stok masuk ke {$toLocation}:\n\n"
            . "*Dari:* {$fromLocation}\n"
            . "*Referensi:* {$referenceCode}\n"
            . "*Pengirim:* {$this->senderName}\n\n"
            . "*Item:*\n{$itemsList}\n\n"
            . "Silakan cek sistem untuk detail lengkap.";
    }
}

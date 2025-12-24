<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;
use App\Models\StockTransfer;
use App\Notifications\Channels\FonnteChannel;

class TransferAcceptedNotification extends Notification
{
    use Queueable;

    public function __construct(
        public StockTransfer $transfer,
        public string $acceptedByName
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
            'title' => '✅ Transfer Diterima',
            'message' => "Transfer {$this->transfer->reference_code} ke {$this->transfer->toLocation->name} telah diterima oleh {$this->acceptedByName}",
            'action_url' => route('transactions.transfers.show', $this->transfer->id),
            'icon' => 'CheckCircle',
            'type' => 'success',
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
        return "*TRANSFER DITERIMA* ✅\n\n"
            . "Halo {$notifiable->name},\n\n"
            . "Transfer stok Anda telah diterima:\n"
            . "```"
            . "Ref     : {$this->transfer->reference_code}\n"
            . "Tujuan  : {$this->transfer->toLocation->name}\n"
            . "Diterima: {$this->acceptedByName}\n"
            . "Waktu   : " . now()->format('d/m/Y H:i')
            . "```\n\n"
            . "*Akses Sistem:*\n"
            . route('transactions.transfers.show', $this->transfer->id);
    }
}

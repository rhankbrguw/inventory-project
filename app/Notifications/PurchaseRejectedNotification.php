<?php

namespace App\Notifications;

use App\Notifications\Channels\FonnteChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class PurchaseRejectedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public $purchase,
        public $rejectorName,
        public $reason
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
            'title' => $isIndonesian ? '❌ Permintaan Ditolak' : '❌ Request Rejected',
            'message' => $isIndonesian
                ? "Permintaan stok {$this->purchase->reference_code} ditolak. Alasan: {$this->reason}"
                : "Stock request {$this->purchase->reference_code} rejected. Reason: {$this->reason}",
            'action_url' => route('transactions.purchases.show', $this->purchase->id),
            'icon' => 'XCircle',
            'type' => 'warning',
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

        $labelRef = str_pad('Ref', 9);
        $labelStatus = str_pad('Status', 9);
        $labelOleh = str_pad('Oleh', 9);
        $labelAlasan = str_pad('Alasan', 9);

        return "*PERMINTAAN DITOLAK* ❌\n\n"
            . "Halo {$notifiable->name},\n\n"
            . "Request stok Anda telah *ditolak*:\n"
            . "```"
            . "{$labelRef}: {$this->purchase->reference_code}\n"
            . "{$labelStatus}: REJECTED\n"
            . "{$labelOleh}: {$this->rejectorName}\n"
            . "{$labelAlasan}: {$this->reason}"
            . "```\n\n"
            . "*Akses Sistem:*\n"
            . route('transactions.purchases.show', $this->purchase->id);
    }
}

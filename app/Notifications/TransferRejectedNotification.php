<?php

namespace App\Notifications;

use App\Notifications\Channels\FonnteChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class TransferRejectedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public $transfer,
        public $rejectedByName,
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
        $isIndonesian = $this->getUserLocale($notifiable) === 'id';

        return [
            'title' => $isIndonesian ? '❌ Transfer Ditolak' : '❌ Transfer Rejected',
            'message' => $isIndonesian
                ? "Transfer {$this->transfer->reference_code} ditolak. Alasan: {$this->reason}"
                : "Transfer {$this->transfer->reference_code} rejected. Reason: {$this->reason}",
            'action_url' => route('transactions.transfers.show', $this->transfer->id),
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

        if ($isIndonesian) {
            $labelRef = str_pad("Ref", 9);
            $labelStatus = str_pad("Status", 9);
            $labelDitolak = str_pad("Ditolak", 9);
            $labelLokasi = str_pad("Lokasi", 9);
            $labelTanggal = str_pad("Tanggal", 9);

            return "*TRANSFER DITOLAK* ❌\n\n"
                . "Halo {$notifiable->name},\n\n"
                . "Transfer stok telah ditolak:\n"
                . "```"
                . "{$labelRef}: {$this->transfer->reference_code}\n"
                . "{$labelStatus}: DITOLAK\n"
                . "{$labelDitolak}: {$this->rejectedByName}\n"
                . "{$labelLokasi}: {$this->transfer->toLocation->name}\n"
                . "{$labelTanggal}: {$date}"
                . "```\n\n"
                . "*Alasan Penolakan:*\n"
                . "_{$this->reason}_\n\n"
                . "*Akses Sistem:*\n"
                . route('transactions.transfers.show', $this->transfer->id);
        } else {
            $labelRef = str_pad("Ref", 9);
            $labelStatus = str_pad("Status", 9);
            $labelRejected = str_pad("Rejected", 9);
            $labelLocation = str_pad("Location", 9);
            $labelDate = str_pad("Date", 9);

            return "*TRANSFER REJECTED* ❌\n\n"
                . "Hello {$notifiable->name},\n\n"
                . "Stock transfer has been rejected:\n"
                . "```"
                . "{$labelRef}: {$this->transfer->reference_code}\n"
                . "{$labelStatus}: REJECTED\n"
                . "{$labelRejected}: {$this->rejectedByName}\n"
                . "{$labelLocation}: {$this->transfer->toLocation->name}\n"
                . "{$labelDate}: {$date}"
                . "```\n\n"
                . "*Rejection Reason:*\n"
                . "_{$this->reason}_\n\n"
                . "*System Access:*\n"
                . route('transactions.transfers.show', $this->transfer->id);
        }
    }

    private function getUserLocale(object $notifiable): string
    {
        return $notifiable->locale ?? config('app.locale', 'id');
    }
}

<?php

namespace App\Notifications;

use App\Notifications\Channels\FonnteChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class SellRejectedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public $sell,
        public $rejectorName,
        public $reason
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
            'title' => $isIndonesian
                ? '❌ Pesanan Ditolak'
                : '❌ Order Rejected',
            'message' => $isIndonesian
                ? "Pesanan {$this->sell->reference_code} ditolak. Alasan: {$this->reason}"
                : "Order {$this->sell->reference_code} rejected. Reason: {$this->reason}",
            'action_url' => route('transactions.sells.show', $this->sell->id),
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
        $isIndonesian = $this->getUserLocale($notifiable) === 'id';
        $date = now()->format('d/m/Y H:i');

        if ($isIndonesian) {
            $labelRef = str_pad('Ref', 9);
            $labelStatus = str_pad('Status', 9);
            $labelRejected = str_pad('Ditolak', 9);
            $labelAlasan = str_pad('Alasan', 9);
            $labelTanggal = str_pad('Tanggal', 9);

            return "*PESANAN DITOLAK* ❌\n\n"
                . "Halo {$notifiable->name},\n\n"
                . "Pesanan Anda telah *ditolak*:\n"
                . "```"
                . "{$labelRef}: {$this->sell->reference_code}\n"
                . "{$labelStatus}: DITOLAK\n"
                . "{$labelRejected}: {$this->rejectorName}\n"
                . "{$labelAlasan}: {$this->reason}\n"
                . "{$labelTanggal}: {$date}"
                . "```\n\n"
                . "*Cek detail di sistem:*\n"
                . route('transactions.sells.show', $this->sell->id);
        }

        $labelRef = str_pad('Ref', 9);
        $labelStatus = str_pad('Status', 9);
        $labelRejected = str_pad('Rejected', 9);
        $labelReason = str_pad('Reason', 9);
        $labelDate = str_pad('Date', 9);

        return "*ORDER REJECTED* ❌\n\n"
            . "Hello {$notifiable->name},\n\n"
            . "Your order has been *rejected*:\n"
            . "```"
            . "{$labelRef}: {$this->sell->reference_code}\n"
            . "{$labelStatus}: REJECTED\n"
            . "{$labelRejected}: {$this->rejectorName}\n"
            . "{$labelReason}: {$this->reason}\n"
            . "{$labelDate}: {$date}"
            . "```\n\n"
            . "*System Access:*\n"
            . route('transactions.sells.show', $this->sell->id);
    }

    private function getUserLocale(object $notifiable): string
    {
        return $notifiable->locale ?? config('app.locale', 'id');
    }
}

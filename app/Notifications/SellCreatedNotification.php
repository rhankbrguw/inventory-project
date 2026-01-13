<?php

namespace App\Notifications;

use App\Notifications\Channels\FonnteChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class SellCreatedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public $sell,
        public $creatorName
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
                ? '📦 Pesanan Masuk Baru'
                : '📦 New Order Request',
            'message' => $isIndonesian
                ? "Pesanan {$this->sell->reference_code} dari {$this->sell->location->name} menunggu persetujuan."
                : "Order {$this->sell->reference_code} from {$this->sell->location->name} awaiting approval.",
            'action_url' => route('transactions.sells.show', $this->sell->id),
            'sender' => $this->creatorName,
            'icon' => 'ClipboardList',
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
        $isIndonesian = $this->getUserLocale($notifiable) === 'id';
        $date = now()->format('d/m/Y H:i');

        $items = $this->sell->items()->get();

        $totalQty = $items->sum('quantity');

        if ($isIndonesian) {
            $labelRef = str_pad('Ref', 9);
            $labelDari = str_pad('Dari', 9);
            $labelOleh = str_pad('Oleh', 9);
            $labelTotal = str_pad('Total', 9);
            $labelTanggal = str_pad('Tanggal', 9);

            return "*PESANAN MASUK BARU* 📦\n\n"
                . "Halo {$notifiable->name},\n\n"
                . "Ada pesanan stok baru yang menunggu persetujuan Anda:\n"
                . "```"
                . "{$labelRef}: {$this->sell->reference_code}\n"
                . "{$labelDari}: {$this->sell->location->name}\n"
                . "{$labelOleh}: {$this->creatorName}\n"
                . "{$labelTotal}: {$totalQty} Unit / Rp " . number_format($this->sell->total_price, 0, ',', '.') . "\n"
                . "{$labelTanggal}: {$date}"
                . "```\n\n"
                . "Mohon tinjau dan setujui.\n\n"
                . "*Akses Sistem:*\n"
                . route('transactions.sells.show', $this->sell->id);
        }

        $labelRef = str_pad('Ref', 9);
        $labelFrom = str_pad('From', 9);
        $labelBy = str_pad('By', 9);
        $labelTotal = str_pad('Total', 9);
        $labelDate = str_pad('Date', 9);

        return "*NEW ORDER REQUEST* 📦\n\n"
            . "Hello {$notifiable->name},\n\n"
            . "New stock order awaiting your approval:\n"
            . "```"
            . "{$labelRef}: {$this->sell->reference_code}\n"
            . "{$labelFrom}: {$this->sell->location->name}\n"
            . "{$labelBy}: {$this->creatorName}\n"
            . "{$labelTotal}: {$totalQty} Units / Rp " . number_format($this->sell->total_price, 0, ',', '.') . "\n"
            . "{$labelDate}: {$date}"
            . "```\n\n"
            . "Please review and approve.\n\n"
            . "*System Access:*\n"
            . route('transactions.sells.show', $this->sell->id);
    }

    private function getUserLocale(object $notifiable): string
    {
        return $notifiable->locale ?? config('app.locale', 'id');
    }
}

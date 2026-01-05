<?php

namespace App\Notifications;

use App\Notifications\Channels\FonnteChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class SellAcceptedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public $sell,
        public $approverName
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
            'title' => $isIndonesian
                ? '✅ Pesanan Disetujui'
                : '✅ Order Approved',
            'message' => $isIndonesian
                ? "Pesanan {$this->sell->reference_code} telah disetujui. Silakan proses pengiriman."
                : "Order {$this->sell->reference_code} approved. Please proceed to shipping.",
            'action_url' => route('transactions.sells.show', $this->sell->id),
            'icon' => 'CheckCircle',
            'type' => 'success',
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

        $items = $this->sell->stockMovements()
            ->where('type', 'sell')
            ->with('product')
            ->get();

        $totalQty = $items->sum(fn($i) => abs($i->quantity));

        if ($isIndonesian) {
            $labelRef = str_pad('Ref', 9);
            $labelStatus = str_pad('Status', 9);
            $labelApproved = str_pad('Disetujui', 9);
            $labelTujuan = str_pad('Tujuan', 9);
            $labelTotal = str_pad('Total', 9);
            $labelTanggal = str_pad('Tanggal', 9);

            return "*PESANAN DISETUJUI* ✅\n\n"
                . "Halo {$notifiable->name},\n\n"
                . "Pesanan penjualan telah *disetujui*:\n"
                . "```"
                . "{$labelRef}: {$this->sell->reference_code}\n"
                . "{$labelStatus}: DISETUJUI\n"
                . "{$labelApproved}: {$this->approverName}\n"
                . "{$labelTujuan}: {$this->sell->customer->name}\n"
                . "{$labelTotal}: {$totalQty} Unit\n"
                . "{$labelTanggal}: {$date}"
                . "```\n\n"
                . "Silakan lanjutkan proses pengiriman.\n\n"
                . "*Akses Sistem:*\n"
                . route('transactions.sells.show', $this->sell->id);
        }

        $labelRef = str_pad('Ref', 9);
        $labelStatus = str_pad('Status', 9);
        $labelApproved = str_pad('Approved', 9);
        $labelDest = str_pad('Dest', 9);
        $labelTotal = str_pad('Total', 9);
        $labelDate = str_pad('Date', 9);

        return "*ORDER APPROVED* ✅\n\n"
            . "Hello {$notifiable->name},\n\n"
            . "Sales order has been *approved*:\n"
            . "```"
            . "{$labelRef}: {$this->sell->reference_code}\n"
            . "{$labelStatus}: APPROVED\n"
            . "{$labelApproved}: {$this->approverName}\n"
            . "{$labelDest}: {$this->sell->customer->name}\n"
            . "{$labelTotal}: {$totalQty} Units\n"
            . "{$labelDate}: {$date}"
            . "```\n\n"
            . "Please proceed with shipment.\n\n"
            . "*System Access:*\n"
            . route('transactions.sells.show', $this->sell->id);
    }

    private function getUserLocale(object $notifiable): string
    {
        return $notifiable->locale ?? config('app.locale', 'id');
    }
}

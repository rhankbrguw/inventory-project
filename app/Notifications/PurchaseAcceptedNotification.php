<?php

namespace App\Notifications;

use App\Notifications\Channels\FonnteChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class PurchaseAcceptedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public $purchase,
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
        $isIndonesian = ($notifiable->locale ?? 'id') === 'id';

        return [
            'title' => $isIndonesian ? '✅ Permintaan Disetujui' : '✅ Request Approved',
            'message' => $isIndonesian
                ? "Permintaan stok {$this->purchase->reference_code} telah disetujui oleh {$this->approverName}."
                : "Stock request {$this->purchase->reference_code} approved by {$this->approverName}.",
            'action_url' => route('transactions.purchases.show', $this->purchase->id),
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
        $date = now()->format('d/m/Y H:i');

        $items = $this->purchase->items;
        $totalQty = $items->sum('quantity');

        $labelRef = str_pad('Ref', 9);
        $labelStatus = str_pad('Status', 9);
        $labelOleh = str_pad('Oleh', 9);
        $labelTotal = str_pad('Total', 9);
        $labelDate = str_pad('Tanggal', 9);

        return "*PERMINTAAN DISETUJUI* ✅\n\n"
            . "Halo {$notifiable->name},\n\n"
            . "Request stok Anda sedang diproses:\n"
            . "```"
            . "{$labelRef}: {$this->purchase->reference_code}\n"
            . "{$labelStatus}: ON PROCESS\n"
            . "{$labelOleh}: {$this->approverName}\n"
            . "{$labelTotal}: {$totalQty} Unit\n"
            . "{$labelDate}: {$date}"
            . "```\n\n"
            . "Barang akan segera dikirim dari Gudang.\n\n"
            . "*Akses Sistem:*\n"
            . route('transactions.purchases.show', $this->purchase->id);
    }
}

<?php

namespace App\Notifications;

use App\Notifications\Channels\FonnteChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class TransferAcceptedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public $transfer,
        public $acceptedByName
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
            'title' => $isIndonesian ? '✅ Transfer Selesai' : '✅ Transfer Completed',
            'message' => $isIndonesian
                ? "Transfer {$this->transfer->reference_code} diterima di {$this->transfer->toLocation->name}"
                : "Transfer {$this->transfer->reference_code} received at {$this->transfer->toLocation->name}",
            'action_url' => route('transactions.transfers.show', $this->transfer->id),
            'icon' => 'CheckCircle',
            'type' => 'success',
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

        $items = $this->transfer->stockMovements()
            ->where('type', 'transfer_in')
            ->with('product')
            ->get();

        $totalQty = $items->sum(fn($i) => abs($i->quantity));

        if ($isIndonesian) {
            $labelRef = str_pad("Ref", 9);
            $labelStatus = str_pad("Status", 9);
            $labelDiterima = str_pad("Diterima", 9);
            $labelLokasi = str_pad("Lokasi", 9);
            $labelTotal = str_pad("Total", 9);
            $labelTanggal = str_pad("Tanggal", 9);

            return "*TRANSFER SELESAI* ✅\n\n"
                . "Halo {$notifiable->name},\n\n"
                . "Transfer stok telah berhasil diselesaikan:\n"
                . "```"
                . "{$labelRef}: {$this->transfer->reference_code}\n"
                . "{$labelStatus}: SELESAI\n"
                . "{$labelDiterima}: {$this->acceptedByName}\n"
                . "{$labelLokasi}: {$this->transfer->toLocation->name}\n"
                . "{$labelTotal}: {$totalQty} Unit\n"
                . "{$labelTanggal}: {$date}"
                . "```\n\n"
                . "*Akses Sistem:*\n"
                . route('transactions.transfers.show', $this->transfer->id);
        } else {
            $labelRef = str_pad("Ref", 9);
            $labelStatus = str_pad("Status", 9);
            $labelReceived = str_pad("Received", 9);
            $labelLocation = str_pad("Location", 9);
            $labelTotal = str_pad("Total", 9);
            $labelDate = str_pad("Date", 9);

            return "*TRANSFER COMPLETED* ✅\n\n"
                . "Hello {$notifiable->name},\n\n"
                . "Stock transfer has been successfully completed:\n"
                . "```"
                . "{$labelRef}: {$this->transfer->reference_code}\n"
                . "{$labelStatus}: COMPLETED\n"
                . "{$labelReceived}: {$this->acceptedByName}\n"
                . "{$labelLocation}: {$this->transfer->toLocation->name}\n"
                . "{$labelTotal}: {$totalQty} Units\n"
                . "{$labelDate}: {$date}"
                . "```\n\n"
                . "*System Access:*\n"
                . route('transactions.transfers.show', $this->transfer->id);
        }
    }

    private function getUserLocale(object $notifiable): string
    {
        return $notifiable->locale ?? config('app.locale', 'id');
    }
}

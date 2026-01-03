<?php

namespace App\Notifications;

use App\Notifications\Channels\FonnteChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class TransferShippedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public $transfer,
        public $senderName
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
                ? '🚚 Barang Dalam Pengiriman'
                : '🚚 Items Shipped',
            'message' => $isIndonesian
                ? "Transfer {$this->transfer->reference_code} sedang dalam perjalanan ke lokasi Anda."
                : "Transfer {$this->transfer->reference_code} is on the way to your location.",
            'action_url' => route('transactions.transfers.show', $this->transfer->id),
            'icon' => 'Truck',
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

        $items = $this->transfer->stockMovements()
            ->where('type', 'transfer_out')
            ->with('product')
            ->get();

        $totalItems = $items->count();
        $totalQty = $items->sum(fn ($i) => abs($i->quantity));

        $itemsList = $items->take(5)->map(
            fn ($item) =>
            "• {$item->product->name}: " . abs($item->quantity) . " {$item->product->unit}"
        )->join("\n");

        if ($items->count() > 5) {
            $moreText = $isIndonesian
                ? 'dan ' . ($items->count() - 5) . ' item lainnya'
                : 'and ' . ($items->count() - 5) . ' more items';

            $itemsList .= "\n_{$moreText}_";
        }

        if ($isIndonesian) {
            $labelRef     = str_pad('Ref', 9);
            $labelAsal    = str_pad('Dari', 9);
            $labelOleh    = str_pad('Oleh', 9);
            $labelTotal   = str_pad('Total', 9);
            $labelTanggal = str_pad('Tanggal', 9);

            return "*BARANG DALAM PENGIRIMAN* 🚚\n\n"
                . "Halo {$notifiable->name},\n\n"
                . "Barang transfer sedang dikirim:\n"
                . "```"
                . "{$labelRef}: {$this->transfer->reference_code}\n"
                . "{$labelAsal}: {$this->transfer->fromLocation->name}\n"
                . "{$labelOleh}: {$this->senderName}\n"
                . "{$labelTotal}: {$totalItems} SKU / {$totalQty} Unit\n"
                . "{$labelTanggal}: {$date}"
                . "```\n\n"
                . "*Rincian Barang:*\n"
                . "{$itemsList}\n\n"
                . "*Siapkan penerimaan di sistem:*\n"
                . route('transactions.transfers.show', $this->transfer->id);
        }

        $labelRef   = str_pad('Ref', 9);
        $labelFrom  = str_pad('From', 9);
        $labelBy    = str_pad('By', 9);
        $labelTotal = str_pad('Total', 9);
        $labelDate  = str_pad('Date', 9);

        return "*ITEMS SHIPPED* 🚚\n\n"
            . "Hello {$notifiable->name},\n\n"
            . "Transfer items are being shipped:\n"
            . "```"
            . "{$labelRef}: {$this->transfer->reference_code}\n"
            . "{$labelFrom}: {$this->transfer->fromLocation->name}\n"
            . "{$labelBy}: {$this->senderName}\n"
            . "{$labelTotal}: {$totalItems} SKU / {$totalQty} Units\n"
            . "{$labelDate}: {$date}"
            . "```\n\n"
            . "*Items:*\n"
            . "{$itemsList}\n\n"
            . "*System Access:*\n"
            . route('transactions.transfers.show', $this->transfer->id);
    }

    private function getUserLocale(object $notifiable): string
    {
        return $notifiable->locale ?? config('app.locale', 'id');
    }
}

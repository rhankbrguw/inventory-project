<?php

namespace App\Notifications;

use App\Notifications\Channels\FonnteChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class StockTransferNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public $transfer,
        public $senderName
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
            'title' => $isIndonesian ? '📦 Stok Masuk Baru' : '📦 Incoming Transfer',
            'message' => $isIndonesian
                ? "Kiriman dari {$this->transfer->fromLocation->name} (Ref: {$this->transfer->reference_code})"
                : "Transfer from {$this->transfer->fromLocation->name} (Ref: {$this->transfer->reference_code})",
            'action_url' => route('transactions.transfers.show', $this->transfer->id),
            'sender' => $this->senderName,
            'icon' => 'Truck',
            'type' => 'info',
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
            ->where('type', 'transfer_out')
            ->with('product')
            ->get();

        $totalItems = $items->count();
        $totalQty = $items->sum(fn($i) => abs($i->quantity));

        $itemsList = $items->take(5)->map(function ($item) {
            return "• {$item->product->name}: " . abs($item->quantity) . " {$item->product->unit}";
        })->join("\n");

        if ($items->count() > 5) {
            $moreText = $isIndonesian ? "dan " . ($items->count() - 5) . " item lainnya" : "and " . ($items->count() - 5) . " more";
            $itemsList .= "\n_{$moreText}_";
        }

        if ($isIndonesian) {
            $labelTanggal = str_pad("Tanggal", 9);
            $labelAsal = str_pad("Asal", 9);
            $labelTujuan = str_pad("Tujuan", 9);
            $labelOleh = str_pad("Oleh", 9);
            $labelRef = str_pad("Ref", 9);
            $labelTotal = str_pad("Total", 9);

            return "*STOK MASUK BARU* 📦\n\n"
                . "Halo {$notifiable->name},\n\n"
                . "Transfer stok baru telah tercatat:\n"
                . "```"
                . "{$labelTanggal}: {$date}\n"
                . "{$labelAsal}: {$this->transfer->fromLocation->name}\n"
                . "{$labelTujuan}: {$this->transfer->toLocation->name}\n"
                . "{$labelOleh}: {$this->senderName}\n"
                . "{$labelRef}: {$this->transfer->reference_code}\n"
                . "{$labelTotal}: {$totalItems} SKU / {$totalQty} Unit"
                . "```\n\n"
                . "*Detail Barang:*\n"
                . "{$itemsList}\n\n"
                . "*Akses Sistem:*\n"
                . route('transactions.transfers.show', $this->transfer->id);
        } else {
            $labelDate = str_pad("Date", 9);
            $labelOrigin = str_pad("Origin", 9);
            $labelDest = str_pad("Dest", 9);
            $labelBy = str_pad("By", 9);
            $labelRef = str_pad("Ref", 9);
            $labelTotal = str_pad("Total", 9);

            return "*INCOMING TRANSFER* 📦\n\n"
                . "Hello {$notifiable->name},\n\n"
                . "New stock transfer has been recorded:\n"
                . "```"
                . "{$labelDate}: {$date}\n"
                . "{$labelOrigin}: {$this->transfer->fromLocation->name}\n"
                . "{$labelDest}: {$this->transfer->toLocation->name}\n"
                . "{$labelBy}: {$this->senderName}\n"
                . "{$labelRef}: {$this->transfer->reference_code}\n"
                . "{$labelTotal}: {$totalItems} SKU / {$totalQty} Units"
                . "```\n\n"
                . "*Item Details:*\n"
                . "{$itemsList}\n\n"
                . "*System Access:*\n"
                . route('transactions.transfers.show', $this->transfer->id);
        }
    }

    private function getUserLocale(object $notifiable): string
    {
        return $notifiable->locale ?? config('app.locale', 'id');
    }
}

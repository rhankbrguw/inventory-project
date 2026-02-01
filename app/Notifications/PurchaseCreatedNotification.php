<?php

namespace App\Notifications;

use App\Notifications\Channels\FonnteChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class PurchaseCreatedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public $purchase,
        public $creatorName
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
            'title' => $isIndonesian ? '📦 Permintaan Stok Masuk' : '📦 New Stock Request',
            'message' => $isIndonesian
                ? "{$this->creatorName} dari {$this->purchase->location->name} meminta stok (Ref: {$this->purchase->reference_code})."
                : "{$this->creatorName} from {$this->purchase->location->name} requests stock (Ref: {$this->purchase->reference_code}).",
            'action_url' => route('transactions.purchases.show', $this->purchase->id),
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
        $date = now()->format('d/m/Y H:i');
        $items = $this->purchase->items()->with('product')->get();
        $totalQty = $items->sum('quantity');

        $labelRef = str_pad('Ref', 9);
        $labelDari = str_pad('Peminta', 9);
        $labelTotal = str_pad('Total', 9);
        $labelTanggal = str_pad('Tanggal', 9);

        return "*PERMINTAAN STOK BARU* 📦\n\n"
            . "Halo {$notifiable->name},\n\n"
            . "Ada permintaan stok baru dari cabang:\n"
            . "```"
            . "{$labelRef}: {$this->purchase->reference_code}\n"
            . "{$labelDari}: {$this->purchase->location->name}\n"
            . "{$labelTotal}: {$totalQty} Unit\n"
            . "{$labelTanggal}: {$date}"
            . "```\n\n"
            . "Mohon tinjau ketersediaan stok di Gudang.\n\n"
            . "*Akses Sistem:*\n"
            . route('transactions.purchases.show', $this->purchase->id);
    }
}

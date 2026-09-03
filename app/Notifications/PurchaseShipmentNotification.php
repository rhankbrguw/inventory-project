<?php

namespace App\Notifications;

use App\Notifications\Channels\OpenWaChannel;
use App\Notifications\Concerns\FormatsNotificationContent;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class PurchaseShipmentNotification extends Notification implements ShouldQueue
{
    use FormatsNotificationContent, Queueable;

    public function __construct(public $purchase, public string $senderName) {}

    public function via(object $notifiable): array
    {
        $channels = ['broadcast', 'database'];
        if ($notifiable->phone) {
            $channels[] = OpenWaChannel::class;
        }

        return $channels;
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => __('notifications.purchase_shipped_title'),
            'message' => __('notifications.purchase_shipped_message', [
                'ref' => $this->purchase->reference_code,
                'from' => $this->purchase->fromLocation?->name ?? ($this->purchase->supplier?->name ?? '-'),
                'to' => $this->purchase->location->name,
                'shipper' => $this->senderName,
            ]),
            'action_url' => route('transactions.purchases.show', $this->purchase->id),
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

    public function toOpenWa(object $notifiable): string
    {
        $items = $this->purchase->items()->with('product')->get();
        $totalQty = $this->formatQty($items->sum('quantity'));
        $itemsList = $this->formatItemsSummary($items);
        $fromName = $this->purchase->fromLocation?->name ?? ($this->purchase->supplier?->name ?? '-');

        return __('notifications.purchase_shipped_wa_header')."\n\n"
            .__('notifications.greeting', ['name' => $notifiable->name])."\n\n"
            .__('notifications.purchase_shipped_wa_body')."\n"
            ."```\n"
            .__('notifications.purchase_shipped_label_ref')." : {$this->purchase->reference_code}\n"
            ."Lokasi Asal (Pengirim)  : {$fromName}\n"
            ."Lokasi Tujuan (Pemesan) : {$this->purchase->location->name}\n"
            .__('notifications.purchase_shipped_label_by')." : {$this->senderName}\n"
            ."Total Muatan            : {$totalQty} Unit\n"
            .'Waktu Pengiriman        : '.now()->format('d/m/Y H:i')." WIB\n"
            ."```\n\n"
            .__('notifications.item_details')."\n{$itemsList}\n\n"
            .__('notifications.confirm_receipt')."\n"
            .route('transactions.purchases.show', $this->purchase->id);
    }
}

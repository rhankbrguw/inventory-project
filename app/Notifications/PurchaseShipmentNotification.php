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

        $header = $this->formatWaHeader(__('notifications.purchase_shipped_wa_header'));
        $greeting = __('notifications.greeting', ['name' => $notifiable->name]);
        $body = __('notifications.purchase_shipped_wa_body');

        $details = $this->formatWaKeyValues([
            __('notifications.purchase_shipped_label_ref') => $this->purchase->reference_code,
            __('notifications.label_origin_loc') => $fromName,
            __('notifications.label_target_loc') => $this->purchase->location->name,
            __('notifications.label_shipper') => $this->senderName,
            __('notifications.label_total_load') => "{$totalQty} Unit",
            __('notifications.label_shipping_time') => now()->format('d/m/Y H:i').' WIB',
        ], 16);

        $itemsHeader = '📦 *'.__('notifications.item_details').'*';
        $footer = $this->formatWaFooter(__('notifications.confirm_receipt'), route('transactions.purchases.show', $this->purchase->id));

        return "{$header}\n\n{$greeting}\n\n{$body}\n{$details}\n\n{$itemsHeader}\n{$itemsList}\n\n{$footer}";
    }
}

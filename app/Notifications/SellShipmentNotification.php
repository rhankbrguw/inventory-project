<?php

namespace App\Notifications;

use App\Notifications\Channels\OpenWaChannel;
use App\Notifications\Concerns\FormatsNotificationContent;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class SellShipmentNotification extends Notification implements ShouldQueue
{
    use FormatsNotificationContent, Queueable;

    public function __construct(public $sell, public string $senderName) {}

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
        $isInternal = (bool) $this->sell->target_location_id;
        $title = $isInternal ? __('notifications.sell_shipped_title') : __('notifications.sell_shipped_title_ext');

        return [
            'title' => $title,
            'message' => __('notifications.sell_shipped_message', [
                'ref' => $this->sell->reference_code,
                'from' => $this->sell->location->name,
                'to' => $this->sell->targetLocation?->name ?? ($this->sell->customer?->name ?? '-'),
                'shipper' => $this->senderName,
            ]),
            'action_url' => route('transactions.sells.show', $this->sell->id),
            'icon' => 'Truck', 'type' => 'info', 'created_at' => now(),
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'id' => $this->id, 'type' => static::class, 'data' => $this->toArray($notifiable),
            'read_at' => null, 'created_at' => now()->toISOString(),
        ]);
    }

    public function toOpenWa(object $notifiable): string
    {
        $items = $this->sell->items()->with('product')->get();
        $totalQty = $this->formatQty($items->sum('quantity'));
        $itemsList = $this->formatItemsSummary($items);
        $targetName = $this->sell->targetLocation?->name ?? ($this->sell->customer?->name ?? '-');
        $isInternal = ! empty($this->sell->target_location_id);

        $badge = $isInternal ? __('notifications.sell_shipped_wa_header') : __('notifications.sell_shipped_wa_header_ext');
        $header = $this->formatWaHeader($badge);
        $greeting = __('notifications.greeting', ['name' => $notifiable->name]);
        $body = $isInternal ? __('notifications.sell_shipped_wa_body') : __('notifications.sell_shipped_wa_body_ext');

        $details = $this->formatWaKeyValues([
            __('notifications.sell_shipped_label_ref') => $this->sell->reference_code,
            __('notifications.label_origin_loc') => $this->sell->location->name,
            __('notifications.label_target_loc') => $targetName,
            __('notifications.label_shipper') => $this->senderName,
            __('notifications.label_total_load') => "{$totalQty} Unit",
            __('notifications.label_shipping_time') => now()->format('d/m/Y H:i').' WIB',
        ], 16);

        $itemsHeader = '📦 *'.__('notifications.item_details').'*';
        $footer = $this->formatWaFooter(__('notifications.confirm_receipt'), route('transactions.sells.show', $this->sell->id));

        return "{$header}\n\n{$greeting}\n\n{$body}\n{$details}\n\n{$itemsHeader}\n{$itemsList}\n\n{$footer}";
    }
}

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

        $hdr = $isInternal ? __('notifications.sell_shipped_wa_header') : __('notifications.sell_shipped_wa_header_ext');
        $bdy = $isInternal ? __('notifications.sell_shipped_wa_body') : __('notifications.sell_shipped_wa_body_ext');

        return "{$hdr}\n\n"
            .__('notifications.greeting', ['name' => $notifiable->name])."\n\n"
            ."{$bdy}\n"
            ."```\n"
            .__('notifications.sell_shipped_label_ref')." : {$this->sell->reference_code}\n"
            ."Lokasi Asal (Pengirim) : {$this->sell->location->name}\n"
            ."Lokasi Tujuan          : {$targetName}\n"
            ."Dikirim Oleh           : {$this->senderName}\n"
            ."Total Muatan           : {$totalQty} Unit\n"
            .__('notifications.sell_shipped_label_date').'       : '.now()->format('d/m/Y H:i')." WIB\n"
            ."```\n\n"
            .__('notifications.item_details')."\n{$itemsList}\n\n"
            .__('notifications.confirm_receipt')."\n"
            .route('transactions.sells.show', $this->sell->id);
    }
}

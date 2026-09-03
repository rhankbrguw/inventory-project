<?php

namespace App\Notifications;

use App\Notifications\Channels\OpenWaChannel;
use App\Notifications\Concerns\FormatsNotificationContent;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class SellAcceptedNotification extends Notification implements ShouldQueue
{
    use FormatsNotificationContent, Queueable;

    public function __construct(public $sell, public string $approverName) {}

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
        $title = $isInternal ? __('notifications.sell_accepted_title') : __('notifications.sell_accepted_title_ext');
        $fromName = $this->sell->location?->name ?? '-';
        $toName = $this->sell->targetLocation?->name ?? ($this->sell->customer?->name ?? '-');
        $msg = $isInternal
            ? __('notifications.sell_accepted_message', ['ref' => $this->sell->reference_code, 'from' => $fromName, 'to' => $toName, 'approver' => $this->approverName])
            : __('notifications.sell_accepted_message_ext', ['ref' => $this->sell->reference_code, 'approver' => $this->approverName]);

        return [
            'title' => $title, 'message' => $msg, 'action_url' => route('transactions.sells.show', $this->sell->id),
            'icon' => 'CheckCircle', 'type' => 'success', 'created_at' => now(),
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

        $hdr = $isInternal ? __('notifications.sell_accepted_wa_header') : __('notifications.sell_accepted_wa_header_ext');
        $bdy = $isInternal ? __('notifications.sell_accepted_wa_body') : __('notifications.sell_accepted_wa_body_ext');
        $ftr = $isInternal ? __('notifications.sell_accepted_wa_footer') : __('notifications.sell_accepted_wa_footer_ext');

        return "{$hdr}\n\n"
            .__('notifications.greeting', ['name' => $notifiable->name])."\n\n"
            ."{$bdy}\n"
            ."```\n"
            .__('notifications.sell_accepted_label_ref')." : {$this->sell->reference_code}\n"
            ."Lokasi Asal (Penjual)  : {$this->sell->location->name}\n"
            .__('notifications.sell_accepted_label_target')."       : {$targetName}\n"
            .__('notifications.sell_accepted_label_status').' : '.__('notifications.sell_accepted_status_value')."\n"
            .__('notifications.sell_accepted_label_by')." : {$this->approverName}\n"
            .__('notifications.sell_accepted_label_total')." : {$totalQty} Unit\n"
            .__('notifications.sell_accepted_label_date').' : '.now()->format('d/m/Y H:i')." WIB\n"
            ."```\n\n"
            ."{$ftr}\n\n"
            .__('notifications.item_details')."\n{$itemsList}\n\n"
            ."Akses Sistem:\n"
            .route('transactions.sells.show', $this->sell->id);
    }
}

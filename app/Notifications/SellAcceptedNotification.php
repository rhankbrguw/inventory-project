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

        $badge = $isInternal ? __('notifications.sell_accepted_wa_header') : __('notifications.sell_accepted_wa_header_ext');
        $header = $this->formatWaHeader($badge);
        $greeting = __('notifications.greeting', ['name' => $notifiable->name]);
        $body = $isInternal ? __('notifications.sell_accepted_wa_body') : __('notifications.sell_accepted_wa_body_ext');

        $details = $this->formatWaKeyValues([
            __('notifications.sell_accepted_label_ref') => $this->sell->reference_code,
            __('notifications.label_origin_loc') => $this->sell->location->name,
            __('notifications.sell_accepted_label_target') => $targetName,
            __('notifications.sell_accepted_label_status') => __('notifications.sell_accepted_status_value'),
            __('notifications.sell_accepted_label_by') => $this->approverName,
            __('notifications.sell_accepted_label_total') => "{$totalQty} Unit",
            __('notifications.sell_accepted_label_date') => now()->format('d/m/Y H:i').' WIB',
        ], 16);

        $ftrNote = $isInternal ? __('notifications.sell_accepted_wa_footer') : __('notifications.sell_accepted_wa_footer_ext');
        $itemsHeader = '📦 *'.__('notifications.item_details').'*';
        $footer = $this->formatWaFooter($ftrNote, route('transactions.sells.show', $this->sell->id));

        return "{$header}\n\n{$greeting}\n\n{$body}\n{$details}\n\n{$itemsHeader}\n{$itemsList}\n\n{$footer}";
    }
}

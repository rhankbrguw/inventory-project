<?php

namespace App\Notifications;

use App\Notifications\Channels\OpenWaChannel;
use App\Notifications\Concerns\FormatsNotificationContent;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class SellCreatedNotification extends Notification implements ShouldQueue
{
    use FormatsNotificationContent, Queueable;

    public function __construct(public $sell, public string $creatorName) {}

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
            'title' => __('notifications.sell_created_title'),
            'message' => __('notifications.sell_created_message', [
                'creator' => $this->creatorName, 'location' => $this->sell->location->name, 'ref' => $this->sell->reference_code,
            ]),
            'action_url' => route('transactions.sells.show', $this->sell->id),
            'sender' => $this->creatorName, 'icon' => 'ClipboardList', 'type' => 'info', 'created_at' => now(),
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
        $totalItems = $items->count();
        $totalQty = $this->formatQty($items->sum('quantity'));
        $itemsList = $this->formatItemsSummary($items);
        $totalAmt = $this->formatCurrency($this->sell->total_price);
        $targetName = $this->sell->targetLocation?->name ?? ($this->sell->customer?->name ?? '-');
        $isInternal = ! empty($this->sell->target_location_id);

        $badge = $isInternal ? __('notifications.sell_created_wa_header') : __('notifications.sell_created_wa_header_ext');
        $header = $this->formatWaHeader($badge);
        $greeting = __('notifications.greeting', ['name' => $notifiable->name]);
        $body = $isInternal ? __('notifications.sell_created_wa_body') : __('notifications.sell_created_wa_body_ext');

        $details = $this->formatWaKeyValues([
            __('notifications.sell_created_label_ref') => $this->sell->reference_code,
            __('notifications.sell_created_label_from') => $this->sell->location->name,
            __('notifications.sell_created_label_to') => $targetName,
            __('notifications.label_created_by') => $this->creatorName,
            __('notifications.sell_created_label_total') => "{$totalQty} Unit ({$totalItems} SKU / {$totalAmt})",
            __('notifications.sell_created_label_date') => now()->format('d/m/Y H:i').' WIB',
        ], 16);

        $itemsHeader = '📦 *'.__('notifications.item_details').'*';
        $cta = $isInternal ? __('notifications.sell_created_wa_review') : __('notifications.sell_created_wa_review_ext');
        $footer = $this->formatWaFooter($cta, route('transactions.sells.show', $this->sell->id));

        return "{$header}\n\n{$greeting}\n\n{$body}\n{$details}\n\n{$itemsHeader}\n{$itemsList}\n\n{$footer}";
    }
}

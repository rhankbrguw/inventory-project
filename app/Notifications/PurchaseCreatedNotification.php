<?php

namespace App\Notifications;

use App\Notifications\Channels\OpenWaChannel;
use App\Notifications\Concerns\FormatsNotificationContent;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class PurchaseCreatedNotification extends Notification implements ShouldQueue
{
    use FormatsNotificationContent, Queueable;

    public function __construct(public $purchase, public string $creatorName) {}

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
            'title' => __('notifications.purchase_created_title'),
            'message' => __('notifications.purchase_created_message', [
                'creator' => $this->creatorName,
                'location' => $this->purchase->location->name,
                'ref' => $this->purchase->reference_code,
            ]),
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

    public function toOpenWa(object $notifiable): string
    {
        $items = $this->purchase->items()->with('product')->get();
        $totalItems = $items->count();
        $totalQty = $this->formatQty($items->sum('quantity'));
        $itemsList = $this->formatItemsSummary($items);
        $totalAmt = $this->formatCurrency($this->purchase->total_cost);
        $fromName = $this->purchase->fromLocation?->name ?? ($this->purchase->supplier?->name ?? '-');

        $header = $this->formatWaHeader(__('notifications.purchase_created_wa_header'));
        $greeting = __('notifications.greeting', ['name' => $notifiable->name]);
        $body = __('notifications.purchase_created_wa_body');

        $details = $this->formatWaKeyValues([
            __('notifications.purchase_created_label_ref') => $this->purchase->reference_code,
            __('notifications.label_requester_loc') => $this->purchase->location->name,
            __('notifications.label_source_supply') => $fromName,
            __('notifications.label_requested_by') => $this->creatorName,
            __('notifications.purchase_created_label_total') => "{$totalQty} Unit ({$totalItems} SKU / {$totalAmt})",
            __('notifications.purchase_created_label_date') => now()->format('d/m/Y H:i').' WIB',
        ], 16);

        $itemsHeader = '📦 *'.__('notifications.item_details').'*';
        $footer = $this->formatWaFooter(__('notifications.purchase_created_wa_review'), route('transactions.purchases.show', $this->purchase->id));

        return "{$header}\n\n{$greeting}\n\n{$body}\n{$details}\n\n{$itemsHeader}\n{$itemsList}\n\n{$footer}";
    }
}

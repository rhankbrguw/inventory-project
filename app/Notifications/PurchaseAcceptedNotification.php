<?php

namespace App\Notifications;

use App\Notifications\Channels\OpenWaChannel;
use App\Notifications\Concerns\FormatsNotificationContent;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class PurchaseAcceptedNotification extends Notification implements ShouldQueue
{
    use FormatsNotificationContent, Queueable;

    public function __construct(public $purchase, public string $approverName) {}

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
        $fromName = $this->purchase->fromLocation?->name ?? ($this->purchase->supplier?->name ?? '-');
        $toName = $this->purchase->location?->name ?? '-';
        $message = $this->purchase->isInternal()
            ? __('notifications.purchase_accepted_message_internal', [
                'ref' => $this->purchase->reference_code,
                'from' => $fromName,
                'to' => $toName,
                'approver' => $this->approverName,
            ])
            : __('notifications.purchase_accepted_message', [
                'ref' => $this->purchase->reference_code,
                'approver' => $this->approverName,
            ]);

        return [
            'title' => __('notifications.purchase_accepted_title'),
            'message' => $message,
            'action_url' => route('transactions.purchases.show', $this->purchase->id),
            'icon' => 'CheckCircle',
            'type' => 'success',
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
        $footerNote = $this->purchase->isInternal()
            ? __('notifications.purchase_accepted_wa_footer_internal')
            : __('notifications.purchase_accepted_wa_footer');

        $header = $this->formatWaHeader(__('notifications.purchase_accepted_wa_header'));
        $greeting = __('notifications.greeting', ['name' => $notifiable->name]);
        $body = __('notifications.purchase_accepted_wa_body');

        $details = $this->formatWaKeyValues([
            __('notifications.purchase_accepted_label_ref') => $this->purchase->reference_code,
            __('notifications.label_requester_loc') => $this->purchase->location->name,
            __('notifications.label_source_supply') => $fromName,
            __('notifications.purchase_accepted_label_status') => __('notifications.purchase_accepted_status_value'),
            __('notifications.purchase_accepted_label_by') => $this->approverName,
            __('notifications.purchase_accepted_label_total') => "{$totalQty} Unit",
            __('notifications.purchase_accepted_label_date') => now()->format('d/m/Y H:i').' WIB',
        ], 16);

        $itemsHeader = '📦 *'.__('notifications.item_details').'*';
        $footer = $this->formatWaFooter($footerNote, route('transactions.purchases.show', $this->purchase->id));

        return "{$header}\n\n{$greeting}\n\n{$body}\n{$details}\n\n{$itemsHeader}\n{$itemsList}\n\n{$footer}";
    }
}

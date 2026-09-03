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
        $footer = $this->purchase->isInternal()
            ? __('notifications.purchase_accepted_wa_footer_internal')
            : __('notifications.purchase_accepted_wa_footer');

        return __('notifications.purchase_accepted_wa_header')."\n\n"
            .__('notifications.greeting', ['name' => $notifiable->name])."\n\n"
            .__('notifications.purchase_accepted_wa_body')."\n"
            ."```\n"
            .__('notifications.purchase_accepted_label_ref')." : {$this->purchase->reference_code}\n"
            ."Lokasi Pemesan : {$this->purchase->location->name}\n"
            ."Sumber Pasokan : {$fromName}\n"
            .__('notifications.purchase_accepted_label_status').' : '.__('notifications.purchase_accepted_status_value')."\n"
            .__('notifications.purchase_accepted_label_by')." : {$this->approverName}\n"
            .__('notifications.purchase_accepted_label_total')." : {$totalQty} Unit\n"
            .__('notifications.purchase_accepted_label_date').' : '.now()->format('d/m/Y H:i')." WIB\n"
            ."```\n\n"
            .__('notifications.item_details')."\n{$itemsList}\n\n"
            .$footer."\n"
            .route('transactions.purchases.show', $this->purchase->id);
    }
}

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

        return __('notifications.purchase_created_wa_header')."\n\n"
            .__('notifications.greeting', ['name' => $notifiable->name])."\n\n"
            .__('notifications.purchase_created_wa_body')."\n"
            ."```\n"
            .__('notifications.purchase_created_label_ref')." : {$this->purchase->reference_code}\n"
            ."Lokasi Pemohon : {$this->purchase->location->name}\n"
            ."Sumber Pasokan : {$fromName}\n"
            ."Diajukan Oleh  : {$this->creatorName}\n"
            .__('notifications.purchase_created_label_total')." : {$totalQty} Unit ({$totalItems} SKU / {$totalAmt})\n"
            .__('notifications.purchase_created_label_date').' : '.now()->format('d/m/Y H:i')." WIB\n"
            ."```\n\n"
            .__('notifications.item_details')."\n{$itemsList}\n\n"
            .__('notifications.purchase_created_wa_review')."\n"
            .route('transactions.purchases.show', $this->purchase->id);
    }
}

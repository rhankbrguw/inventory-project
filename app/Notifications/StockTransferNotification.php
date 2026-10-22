<?php

namespace App\Notifications;

use App\Notifications\Channels\OpenWaChannel;
use App\Notifications\Concerns\FormatsNotificationContent;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class StockTransferNotification extends Notification implements ShouldQueue
{
    use FormatsNotificationContent, Queueable;

    public function __construct(public $transfer, public string $senderName) {}

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
            'title' => __('notifications.transfer_created_title'),
            'message' => __('notifications.transfer_created_message', [
                'creator' => $this->senderName,
                'ref' => $this->transfer->reference_code,
                'from' => $this->transfer->fromLocation->name,
                'to' => $this->transfer->toLocation->name,
            ]),
            'action_url' => route('transactions.transfers.show', $this->transfer->id),
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
        $items = $this->transfer->stockMovements()->with('product')->get();
        $totalItems = $items->count();
        $totalQty = $this->formatQty($items->sum(fn ($i) => abs($i->quantity)));
        $itemsList = $this->formatItemsSummary($items);

        $header = $this->formatWaHeader(__('notifications.transfer_created_wa_header'));
        $greeting = __('notifications.greeting', ['name' => $notifiable->name]);
        $body = __('notifications.transfer_created_wa_body');

        $details = $this->formatWaKeyValues([
            __('notifications.transfer_created_label_ref') => $this->transfer->reference_code,
            __('notifications.label_origin_loc') => $this->transfer->fromLocation->name,
            __('notifications.label_target_loc') => $this->transfer->toLocation->name,
            __('notifications.label_requested_by') => $this->senderName,
            __('notifications.transfer_created_label_total') => "{$totalQty} Unit ({$totalItems} SKU)",
            __('notifications.transfer_created_label_date') => now()->format('d/m/Y H:i').' WIB',
        ], 16);

        $itemsHeader = '📦 *'.__('notifications.item_details').'*';
        $footer = $this->formatWaFooter(__('notifications.transfer_created_action_cta'), route('transactions.transfers.show', $this->transfer->id));

        return "{$header}\n\n{$greeting}\n\n{$body}\n{$details}\n\n{$itemsHeader}\n{$itemsList}\n\n{$footer}";
    }
}

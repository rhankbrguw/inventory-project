<?php

namespace App\Notifications;

use App\Notifications\Channels\OpenWaChannel;
use App\Notifications\Concerns\FormatsNotificationContent;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class TransferAcceptedNotification extends Notification implements ShouldQueue
{
    use FormatsNotificationContent, Queueable;

    public function __construct(
        public $transfer,
        public string $acceptedByName
    ) {}

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
            'title' => __('notifications.transfer_accepted_title'),
            'message' => __('notifications.transfer_accepted_message', [
                'ref' => $this->transfer->reference_code,
                'from' => $this->transfer->fromLocation?->name ?? '-',
                'to' => $this->transfer->toLocation?->name ?? '-',
                'approver' => $this->acceptedByName,
            ]),
            'action_url' => route('transactions.transfers.show', $this->transfer->id),
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
        $items = $this->transfer->stockMovements()->with('product')->get();
        $totalQty = $this->formatQty($items->sum(fn ($i) => abs($i->quantity)));
        $itemsList = $this->formatItemsSummary($items);

        $header = $this->formatWaHeader(__('notifications.transfer_accepted_wa_header'));
        $greeting = __('notifications.greeting', ['name' => $notifiable->name]);
        $body = __('notifications.transfer_accepted_wa_body');

        $details = $this->formatWaKeyValues([
            __('notifications.transfer_accepted_label_ref') => $this->transfer->reference_code,
            __('notifications.label_origin_loc') => $this->transfer->fromLocation->name,
            __('notifications.label_target_loc') => $this->transfer->toLocation->name,
            __('notifications.transfer_accepted_label_status') => __('notifications.transfer_accepted_status_value'),
            __('notifications.transfer_accepted_label_by') => $this->acceptedByName,
            __('notifications.transfer_accepted_label_total') => "{$totalQty} Unit",
            __('notifications.transfer_accepted_label_date') => now()->format('d/m/Y H:i').' WIB',
        ], 16);

        $footerNote = __('notifications.transfer_accepted_wa_footer');
        $itemsHeader = '📦 *'.__('notifications.item_details').'*';
        $footer = $this->formatWaFooter($footerNote, route('transactions.transfers.show', $this->transfer->id));

        return "{$header}\n\n{$greeting}\n\n{$body}\n{$details}\n\n{$itemsHeader}\n{$itemsList}\n\n{$footer}";
    }
}

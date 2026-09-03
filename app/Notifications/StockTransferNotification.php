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

        return __('notifications.transfer_created_wa_header')."\n\n"
            .__('notifications.greeting', ['name' => $notifiable->name])."\n\n"
            .__('notifications.transfer_created_wa_body')."\n"
            ."```\n"
            .__('notifications.transfer_created_label_ref')." : {$this->transfer->reference_code}\n"
            .__('notifications.transfer_created_label_from')." : {$this->transfer->fromLocation->name}\n"
            .__('notifications.transfer_created_label_to')." : {$this->transfer->toLocation->name}\n"
            .__('notifications.transfer_created_label_creator')." : {$this->senderName}\n"
            .__('notifications.transfer_created_label_total')." : {$totalQty} Unit ({$totalItems} SKU)\n"
            .__('notifications.transfer_created_label_date').' : '.now()->format('d/m/Y H:i')." WIB\n"
            ."```\n\n"
            .__('notifications.item_details')."\n{$itemsList}\n\n"
            .__('notifications.transfer_created_action_cta')."\n"
            .route('transactions.transfers.show', $this->transfer->id);
    }
}

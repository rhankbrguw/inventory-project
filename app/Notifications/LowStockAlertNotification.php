<?php

namespace App\Notifications;

use App\Notifications\Channels\OpenWaChannel;
use App\Notifications\Concerns\FormatsNotificationContent;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class LowStockAlertNotification extends Notification implements ShouldQueue
{
    use FormatsNotificationContent, Queueable;

    public function __construct(public $lowStockItems, public string $locationName) {}

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
            'title' => __('notifications.low_stock_title'),
            'message' => __('notifications.low_stock_message', ['count' => $this->lowStockItems->count(), 'location' => $this->locationName]),
            'action_url' => route('stock.index'),
            'sender' => __('notifications.system_sender'),
            'icon' => 'AlertTriangle',
            'type' => 'warning',
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
        $items = $this->formatItemsList();

        return __('notifications.low_stock_wa_header')."\n\n"
            .__('notifications.greeting', ['name' => $notifiable->name])."\n\n"
            .__('notifications.low_stock_wa_body')."\n"
            ."```\n"
            .__('notifications.low_stock_label_location')." : {$this->locationName}\n"
            .__('notifications.low_stock_label_total')."    : {$this->lowStockItems->count()} Item SKU\n"
            .__('notifications.low_stock_label_date').'     : '.now()->format('d/m/Y H:i')." WIB\n"
            ."```\n\n"
            .__('notifications.low_stock_items_header')."\n{$items}\n\n"
            .__('notifications.system_access')."\n"
            .route('stock.index');
    }

    private function formatItemsList(): string
    {
        $items = $this->lowStockItems->take(10)->map(function ($i) {
            $qty = $this->formatQty($i->quantity);

            return "• {$i->product->name} ({$i->product->sku}): *{$qty} {$i->product->unit}*";
        })->join("\n");

        if ($this->lowStockItems->count() > 10) {
            $items .= "\n_".__('notifications.and_more', ['count' => $this->lowStockItems->count() - 10]).'_';
        }

        return $items;
    }
}

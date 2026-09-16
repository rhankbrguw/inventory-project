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
        $header = $this->formatWaHeader(__('notifications.low_stock_wa_header'));
        $greeting = __('notifications.greeting', ['name' => $notifiable->name]);
        $body = __('notifications.low_stock_wa_body', ['location' => $this->locationName]);

        $details = $this->formatWaKeyValues([
            __('notifications.low_stock_label_location') => $this->locationName,
            __('notifications.low_stock_label_total') => "{$this->lowStockItems->count()} SKU",
            __('notifications.low_stock_label_date') => now()->format('d/m/Y H:i').' WIB',
        ], 14);

        $items = $this->formatItemsList();
        $itemsHeader = '📦 *'.__('notifications.low_stock_items_header').'*';
        $footer = $this->formatWaFooter(__('notifications.system_access'), route('stock.index'));

        return "{$header}\n\n{$greeting}\n\n{$body}\n{$details}\n\n{$itemsHeader}\n{$items}\n\n{$footer}";
    }

    private function formatItemsList(): string
    {
        $items = $this->lowStockItems->take(10)->map(function ($i) {
            $qty = $this->formatQty($i->quantity);

            return "  • {$i->product->name} ({$i->product->sku}): *{$qty} {$i->product->unit}*";
        })->join("\n");

        if ($this->lowStockItems->count() > 10) {
            $diff = $this->lowStockItems->count() - 10;
            $items .= "\n  _".__('notifications.and_more', ['count' => $diff]).'_';
        }

        return $items;
    }
}

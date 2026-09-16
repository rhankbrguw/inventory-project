<?php

namespace App\Notifications;

use App\Notifications\Channels\OpenWaChannel;
use App\Notifications\Concerns\FormatsNotificationContent;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class PurchaseRejectedNotification extends Notification implements ShouldQueue
{
    use FormatsNotificationContent, Queueable;

    public function __construct(public $purchase, public string $rejectorName, public string $reason) {}

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
            'title' => __('notifications.purchase_rejected_title'),
            'message' => __('notifications.purchase_rejected_message', [
                'ref' => $this->purchase->reference_code,
                'rejector' => $this->rejectorName,
                'reason' => $this->reason,
            ]),
            'action_url' => route('transactions.purchases.show', $this->purchase->id),
            'icon' => 'XCircle',
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
        $fromName = $this->purchase->fromLocation?->name ?? ($this->purchase->supplier?->name ?? '-');

        $header = $this->formatWaHeader(__('notifications.purchase_rejected_wa_header'));
        $greeting = __('notifications.greeting', ['name' => $notifiable->name]);
        $body = __('notifications.purchase_rejected_wa_body');

        $details = $this->formatWaKeyValues([
            __('notifications.purchase_rejected_label_ref') => $this->purchase->reference_code,
            __('notifications.label_requester_loc') => $this->purchase->location->name,
            __('notifications.label_source_supply') => $fromName,
            __('notifications.purchase_rejected_label_status') => __('notifications.purchase_rejected_status_value'),
            __('notifications.purchase_rejected_label_by') => $this->rejectorName,
            __('notifications.label_reason') => $this->reason,
            __('notifications.label_rejection_time') => now()->format('d/m/Y H:i').' WIB',
        ], 16);

        $footer = $this->formatWaFooter(__('notifications.system_access'), route('transactions.purchases.show', $this->purchase->id));

        return "{$header}\n\n{$greeting}\n\n{$body}\n{$details}\n\n{$footer}";
    }
}

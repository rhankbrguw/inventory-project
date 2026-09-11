<?php

namespace App\Notifications;

use App\Notifications\Channels\OpenWaChannel;
use App\Notifications\Concerns\FormatsNotificationContent;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class TransferRejectedNotification extends Notification implements ShouldQueue
{
    use FormatsNotificationContent, Queueable;

    public function __construct(
        public $transfer,
        public string $rejectedByName,
        public string $reason
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
            'title' => __('notifications.transfer_rejected_title'),
            'message' => __('notifications.transfer_rejected_message', [
                'ref' => $this->transfer->reference_code,
                'reason' => $this->reason,
            ]),
            'action_url' => route('transactions.transfers.show', $this->transfer->id),
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
        $header = $this->formatWaHeader(__('notifications.transfer_rejected_wa_header'));
        $greeting = __('notifications.greeting', ['name' => $notifiable->name]);
        $body = __('notifications.transfer_rejected_wa_body');

        $details = $this->formatWaKeyValues([
            __('notifications.transfer_rejected_label_ref') => $this->transfer->reference_code,
            __('notifications.label_origin_loc') => $this->transfer->fromLocation->name,
            __('notifications.label_target_loc') => $this->transfer->toLocation->name,
            __('notifications.transfer_rejected_label_status') => __('notifications.transfer_rejected_status_value'),
            __('notifications.transfer_rejected_label_by') => $this->rejectedByName,
            __('notifications.label_reason') => $this->reason,
            __('notifications.label_rejection_time') => now()->format('d/m/Y H:i').' WIB',
        ], 16);

        $footer = $this->formatWaFooter(__('notifications.transfer_rejected_action_cta'), route('transactions.transfers.show', $this->transfer->id));

        return "{$header}\n\n{$greeting}\n\n{$body}\n{$details}\n\n{$footer}";
    }
}

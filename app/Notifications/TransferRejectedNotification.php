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
        return __('notifications.transfer_rejected_wa_header')."\n\n"
            .__('notifications.greeting', ['name' => $notifiable->name])."\n\n"
            .__('notifications.transfer_rejected_wa_body')."\n"
            ."```\n"
            .__('notifications.transfer_rejected_label_ref')." : {$this->transfer->reference_code}\n"
            .__('notifications.transfer_rejected_label_from')." : {$this->transfer->fromLocation->name}\n"
            .__('notifications.transfer_rejected_label_to')." : {$this->transfer->toLocation->name}\n"
            .__('notifications.transfer_rejected_label_status').' : '.__('notifications.transfer_rejected_status_value')."\n"
            .__('notifications.transfer_rejected_label_by')." : {$this->rejectedByName}\n"
            .__('notifications.transfer_rejected_label_date').' : '.now()->format('d/m/Y H:i')." WIB\n"
            ."```\n\n"
            .__('notifications.transfer_rejected_reason_header')."\n"
            ."_{$this->reason}_\n\n"
            .__('notifications.transfer_rejected_action_cta')."\n"
            .route('transactions.transfers.show', $this->transfer->id);
    }
}

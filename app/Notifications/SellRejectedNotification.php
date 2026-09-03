<?php

namespace App\Notifications;

use App\Notifications\Channels\OpenWaChannel;
use App\Notifications\Concerns\FormatsNotificationContent;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class SellRejectedNotification extends Notification implements ShouldQueue
{
    use FormatsNotificationContent, Queueable;

    public function __construct(public $sell, public string $rejectorName, public string $reason) {}

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
        $isInternal = (bool) $this->sell->target_location_id;
        $title = $isInternal ? __('notifications.sell_rejected_title') : __('notifications.sell_rejected_title_ext');
        $msg = $isInternal
            ? __('notifications.sell_rejected_message', ['ref' => $this->sell->reference_code, 'rejector' => $this->rejectorName, 'reason' => $this->reason, 'target' => $this->sell->targetLocation?->name ?? '-'])
            : __('notifications.sell_rejected_message_ext', ['ref' => $this->sell->reference_code, 'rejector' => $this->rejectorName, 'reason' => $this->reason]);

        return [
            'title' => $title, 'message' => $msg, 'action_url' => route('transactions.sells.show', $this->sell->id),
            'icon' => 'XCircle', 'type' => 'warning', 'created_at' => now(),
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'id' => $this->id, 'type' => static::class, 'data' => $this->toArray($notifiable),
            'read_at' => null, 'created_at' => now()->toISOString(),
        ]);
    }

    public function toOpenWa(object $notifiable): string
    {
        $targetName = $this->sell->targetLocation?->name ?? ($this->sell->customer?->name ?? '-');
        $isInternal = ! empty($this->sell->target_location_id);

        $hdr = $isInternal ? __('notifications.sell_rejected_wa_header') : __('notifications.sell_rejected_wa_header_ext');
        $bdy = $isInternal ? __('notifications.sell_rejected_wa_body') : __('notifications.sell_rejected_wa_body_ext');

        return "{$hdr}\n\n"
            .__('notifications.greeting', ['name' => $notifiable->name])."\n\n"
            ."{$bdy}\n"
            ."```\n"
            .__('notifications.sell_rejected_label_ref')." : {$this->sell->reference_code}\n"
            ."Lokasi Asal (Penjual)  : {$this->sell->location->name}\n"
            ."Tujuan (Pembeli)       : {$targetName}\n"
            .__('notifications.sell_rejected_label_status').' : '.__('notifications.sell_rejected_status_value')."\n"
            .__('notifications.sell_rejected_label_by')." : {$this->rejectorName}\n"
            ."```\n\n"
            ."Alasan Penolakan:\n"
            ."_{$this->reason}_\n\n"
            ."Akses Sistem:\n"
            .route('transactions.sells.show', $this->sell->id);
    }
}

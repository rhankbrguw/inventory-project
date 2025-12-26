<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;
use App\Models\StockTransfer;
use App\Notifications\Channels\FonnteChannel;

class TransferRejectedNotification extends Notification
{
    use Queueable;

    public function __construct(
        public StockTransfer $transfer,
        public string $rejectedByName,
        public string $reason
    ) {
    }

    public function via(object $notifiable): array
    {
        $channels = ['database', 'broadcast'];

        if ($notifiable->phone) {
            $channels[] = FonnteChannel::class;
        }

        return $channels;
    }

    public function toArray(): array
    {
        return [
            'title' => 'Transfer Rejected',
            'message' => "Transfer {$this->transfer->reference_code} to {$this->transfer->toLocation->name} has been rejected: {$this->reason}",
            'action_url' => route('transactions.transfers.show', $this->transfer->id),
            'icon' => 'AlertTriangle',
            'type' => 'warning',
            'created_at' => now(),
        ];
    }

    public function toBroadcast(): BroadcastMessage
    {
        return new BroadcastMessage([
            'id' => $this->id,
            'type' => get_class($this),
            'data' => $this->toArray(),
            'read_at' => null,
            'created_at' => now()->toISOString(),
        ]);
    }

    public function toFonnte(object $notifiable): string
    {
        $items = $this->transfer->stockMovements()
            ->where('type', 'transfer_out')
            ->with('product')
            ->get();

        $totalItems = $items->count();
        $totalQty = $items->sum(fn ($item) => abs($item->quantity));

        return "⚠️ *TRANSFER REJECTION NOTICE*\n"
            . "━━━━━━━━━━━━━━━━━━━━━━━━\n\n"
            . "Dear *{$notifiable->name}*,\n\n"
            . "Your stock transfer request has been declined.\n\n"
            . "*REJECTION DETAILS*\n"
            . "┌─────────────────────────\n"
            . "│ Reference    : {$this->transfer->reference_code}\n"
            . "│ From         : {$this->transfer->fromLocation->name}\n"
            . "│ To           : {$this->transfer->toLocation->name}\n"
            . "│ Rejected By  : {$this->rejectedByName}\n"
            . "│ Date & Time  : " . now()->format('d M Y H:i') . "\n"
            . "│ Total Items  : {$totalItems} ({$totalQty} units)\n"
            . "│ Status       : REJECTED\n"
            . "└─────────────────────────\n\n"
            . "*REASON FOR REJECTION*\n"
            . "{$this->reason}\n\n"
            . "📋 *NEXT STEPS*\n"
            . "  • Review the rejection reason\n"
            . "  • Contact the recipient if clarification needed\n"
            . "  • Submit a new transfer request if applicable\n"
            . "  • Stock levels remain unchanged\n\n"
            . "*View Details*\n"
            . route('transactions.transfers.show', $this->transfer->id) . "\n\n"
            . "━━━━━━━━━━━━━━━━━━━━━━━━\n"
            . "_This is an automated notification from ERP System_";
    }
}

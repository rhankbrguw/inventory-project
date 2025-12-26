<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;
use App\Models\StockTransfer;
use App\Notifications\Channels\FonnteChannel;

class TransferAcceptedNotification extends Notification
{
    use Queueable;

    public function __construct(
        public StockTransfer $transfer,
        public string $acceptedByName
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
            'title' => 'Transfer Accepted',
            'message' => "Transfer {$this->transfer->reference_code} to {$this->transfer->toLocation->name} has been accepted by {$this->acceptedByName}",
            'action_url' => route('transactions.transfers.show', $this->transfer->id),
            'icon' => 'CheckCircle',
            'type' => 'success',
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
            ->where('type', 'transfer_in')
            ->with('product')
            ->get();

        $totalItems = $items->count();
        $totalQty = $items->sum(fn ($item) => abs($item->quantity));

        return "✅ *TRANSFER CONFIRMATION*\n"
            . "━━━━━━━━━━━━━━━━━━━━━━━━\n\n"
            . "Dear *{$notifiable->name}*,\n\n"
            . "Your stock transfer has been successfully accepted.\n\n"
            . "*CONFIRMATION DETAILS*\n"
            . "┌─────────────────────────\n"
            . "│ Reference    : {$this->transfer->reference_code}\n"
            . "│ From         : {$this->transfer->fromLocation->name}\n"
            . "│ To           : {$this->transfer->toLocation->name}\n"
            . "│ Accepted By  : {$this->acceptedByName}\n"
            . "│ Date & Time  : " . now()->format('d M Y H:i') . "\n"
            . "│ Total Items  : {$totalItems} ({$totalQty} units)\n"
            . "│ Status       : COMPLETED\n"
            . "└─────────────────────────\n\n"
            . "✓ Stock levels have been updated\n"
            . "✓ Transfer record has been finalized\n"
            . "✓ All inventory movements recorded\n\n"
            . "*View Details*\n"
            . route('transactions.transfers.show', $this->transfer->id) . "\n\n"
            . "━━━━━━━━━━━━━━━━━━━━━━━━\n"
            . "_This is an automated notification from ERP System_";
    }
}

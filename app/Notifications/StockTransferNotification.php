<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;
use App\Models\StockTransfer;
use App\Notifications\Channels\FonnteChannel;

class StockTransferNotification extends Notification
{
    use Queueable;

    public function __construct(
        public StockTransfer $transfer,
        public string $senderName
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
            'title' => 'Incoming Stock Transfer',
            'message' => "Transfer from {$this->transfer->fromLocation->name} | Ref: {$this->transfer->reference_code}",
            'action_url' => route('transactions.transfers.show', $this->transfer->id),
            'sender' => $this->senderName,
            'icon' => 'Truck',
            'type' => 'info',
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
        $fromLocation = $this->transfer->fromLocation->name;
        $toLocation = $this->transfer->toLocation->name;
        $referenceCode = $this->transfer->reference_code;
        $date = now()->format('d M Y H:i');

        $items = $this->transfer->stockMovements()
            ->where('type', 'transfer_in')
            ->with('product')
            ->get();

        $totalItems = $items->count();
        $totalQty = $items->sum(fn ($item) => abs($item->quantity));

        $itemsList = $items->take(5)->map(function ($item) {
            return "  • {$item->product->name} - " . abs($item->quantity) . " {$item->product->unit}";
        })->join("\n");

        if ($items->count() > 5) {
            $itemsList .= "\n  • +" . ($items->count() - 5) . " item(s) more";
        }

        return "🔔 *STOCK TRANSFER NOTIFICATION*\n"
            . "━━━━━━━━━━━━━━━━━━━━━━━━\n\n"
            . "Dear *{$notifiable->name}*,\n\n"
            . "A new stock transfer has been received at your location.\n\n"
            . "*TRANSFER DETAILS*\n"
            . "┌─────────────────────────\n"
            . "│ Reference    : {$referenceCode}\n"
            . "│ From         : {$fromLocation}\n"
            . "│ To           : {$toLocation}\n"
            . "│ Initiated By : {$this->senderName}\n"
            . "│ Date & Time  : {$date}\n"
            . "│ Total Items  : {$totalItems} ({$totalQty} units)\n"
            . "└─────────────────────────\n\n"
            . "*ITEMS SUMMARY*\n"
            . "{$itemsList}\n\n"
            . "*ACTION REQUIRED*\n"
            . "Please review and process this transfer in the system.\n\n"
            . "🔗 *Access System*\n"
            . route('transactions.transfers.show', $this->transfer->id) . "\n\n"
            . "━━━━━━━━━━━━━━━━━━━━━━━━\n"
            . "_This is an automated notification from ERP System_";
    }
}

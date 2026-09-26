<?php

namespace App\Services;

use App\Models\StockMovement;
use App\Models\StockTransfer;
use App\Models\User;
use App\Notifications\TransferRejectedNotification;
use Illuminate\Support\Facades\DB;

class StockTransferService
{
    public function __construct(
        protected StockService $stockService,
        protected StockTransferNotificationService $notificationService
    ) {}

    public function create(array $attributes, User $user): StockTransfer
    {
        return DB::transaction(function () use ($attributes, $user) {
            $transfer = StockTransfer::create([
                'reference_code' => 'TRF-'.now()->format('YmdHis'), 'from_location_id' => $attributes['from_location_id'],
                'to_location_id' => $attributes['to_location_id'], 'user_id' => $user->id,
                'transfer_date' => $attributes['transfer_date'] ?? now(), 'notes' => $attributes['notes'],
                'status' => StockTransfer::STATUS_PENDING_APPROVAL,
            ]);

            $this->createTransferOutMovements($transfer, $user->id, $attributes);
            $this->notificationService->notifyManagers($transfer, $user, [$transfer->from_location_id, $transfer->to_location_id], 'new_request');

            return $transfer;
        });
    }

    private function createTransferOutMovements(StockTransfer $trf, int $userId, array $attributes): void
    {
        $movements = array_map(fn ($item) => [
            'product_id' => $item['product_id'], 'location_id' => $attributes['from_location_id'],
            'quantity' => -abs($item['quantity']), 'type' => StockMovement::TYPE_TRANSFER_OUT,
            'reference_type' => StockTransfer::class, 'reference_id' => $trf->id,
            'user_id' => $userId, 'date' => $attributes['transfer_date'] ?? now(),
            'notes' => __('messages.transfer.status_pending'), 'created_at' => now(), 'updated_at' => now(),
        ], $attributes['items']);

        StockMovement::insert($movements);
    }

    public function approve(StockTransfer $transfer, User $approver): void
    {
        $transfer->update(['status' => StockTransfer::STATUS_APPROVED]);
        $transfer->loadMissing(['user', 'fromLocation', 'toLocation']);
        $this->notificationService->notifyManagers($transfer, $approver, [$transfer->from_location_id, $transfer->to_location_id], 'approved', $transfer->user_id);
    }

    public function reject(StockTransfer $transfer, User $rejector, string $reason): void
    {
        DB::transaction(function () use ($transfer, $rejector, $reason) {
            $transfer->update(['status' => StockTransfer::STATUS_REJECTED, 'rejected_by' => $rejector->id, 'rejected_at' => now(), 'rejection_reason' => $reason]);
            $transfer->loadMissing('user');
            if ($transfer->user && $transfer->user->id !== $rejector->id) {
                rescue(fn () => $transfer->user->notify(new TransferRejectedNotification($transfer, $rejector->name, $reason)));
            }
        });
    }

    public function ship(StockTransfer $transfer, User $shipper): void
    {
        DB::transaction(function () use ($transfer, $shipper) {
            $transfer->load(['items.product']);
            $transfer->update(['status' => StockTransfer::STATUS_SHIPPING]);
            $this->notificationService->notifyManagers($transfer, $shipper, $transfer->to_location_id, 'shipped', $transfer->user_id);
            $this->dispatchTransferItems($transfer);
        });
    }

    private function dispatchTransferItems(StockTransfer $transfer): void
    {
        foreach ($transfer->items->sortBy('product_id') as $movement) {
            $product = $movement->product;
            $qty = abs($movement->quantity);
            $movement->delete();
            $this->stockService->stockOut(product: $product, locationId: $transfer->from_location_id, qty: $qty, sellPrice: 0, type: StockMovement::TYPE_TRANSFER_OUT, ref: $transfer, notes: __('messages.transfer.status_shipped'));
        }
    }

    public function receive(StockTransfer $transfer, User $receiver, ?string $photoPath = null): void
    {
        DB::transaction(function () use ($transfer, $receiver, $photoPath) {
            $transfer->update(['status' => StockTransfer::STATUS_COMPLETED, 'received_by' => $receiver->id, 'received_at' => now(), 'receipt_photo_path' => $photoPath]);
            $this->receiveTransferInbound($transfer);
        });
    }

    private function receiveTransferInbound(StockTransfer $transfer): void
    {
        $outbound = StockMovement::where('reference_type', StockTransfer::class)->where('reference_id', $transfer->id)->where('type', StockMovement::TYPE_TRANSFER_OUT)->with('product')->get();
        foreach ($outbound->sortBy('product_id') as $m) {
            $this->stockService->stockIn(product: $m->product, locationId: $transfer->to_location_id, qty: abs($m->quantity), cost: $m->average_cost_per_unit ?? 0, type: StockMovement::TYPE_TRANSFER_IN, ref: $transfer, notes: __('messages.transfer.status_received'));
        }
    }
}

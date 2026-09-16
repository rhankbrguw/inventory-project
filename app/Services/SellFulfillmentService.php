<?php

namespace App\Services;

use App\Models\Role;
use App\Models\Sell;
use App\Models\StockMovement;
use App\Models\User;
use App\Notifications\SellShipmentNotification;
use Illuminate\Support\Facades\DB;

class SellFulfillmentService
{
    public function __construct(
        protected StockService $stockService,
        protected InstallmentService $installmentService
    ) {}

    public function ship(Sell $sell, User $shipper): void
    {
        $sell->loadMissing(['items.product', 'user']);
        $destId = $sell->getDestinationLocationId();

        DB::transaction(function () use ($sell) {
            $sell->update(['status' => Sell::STATUS_SHIPPING]);
            $this->dispatchOutboundStock($sell);
        });

        $this->notifyManagersOfShipment($sell, $shipper, $destId);
    }

    private function dispatchOutboundStock(Sell $sell): void
    {
        $destName = $sell->targetLocation?->name ?? $sell->customer?->name ?? __('messages.stock.default_destination');
        foreach ($sell->items->sortBy('product_id') as $item) {
            $this->stockService->stockOut(
                product: $item->product, locationId: $sell->location_id, qty: $item->quantity,
                sellPrice: $item->sell_price, type: 'sell', ref: $sell,
                notes: __('messages.stock.shipped_to', ['location' => $destName]),
                channelId: $item->sales_channel_type_id
            );
        }
    }

    public function receive(Sell $sell, User $receiver, ?string $photoPath = null): void
    {
        $destId = $sell->getDestinationLocationId();
        DB::transaction(function () use ($sell, $destId, $photoPath) {
            $sell->update(['status' => Sell::STATUS_COMPLETED, 'receipt_photo_path' => $photoPath]);
            $this->receiveInboundStock($sell, $destId);
        });
    }

    private function receiveInboundStock(Sell $sell, int $destId): void
    {
        $outbound = StockMovement::where('reference_type', Sell::class)->where('reference_id', $sell->id)->where('type', 'sell')->with('product')->get();

        foreach ($outbound->sortBy('product_id') as $m) {
            $this->stockService->stockIn(
                product: $m->product, locationId: $destId, qty: abs($m->quantity),
                cost: $m->cost_per_unit, type: 'purchase', ref: $sell,
                notes: __('messages.sell.received_from', ['location' => $sell->location->name])
            );
        }
    }

    private function notifyManagersOfShipment(Sell $sell, User $shipper, ?int $destinationLocationId): void
    {
        $targetRoleIds = Role::whereIn('code', [Role::CODE_BRANCH_MGR, Role::CODE_WAREHOUSE_MGR])->pluck('id');

        $recipients = User::where(function ($query) use ($destinationLocationId, $targetRoleIds, $sell) {
            if ($destinationLocationId && $targetRoleIds->isNotEmpty()) {
                $query->whereHas('locations', fn ($q) => $q->where('locations.id', $destinationLocationId)->whereIn('location_user.role_id', $targetRoleIds));
            }
            if ($sell->user_id) {
                $query->orWhere('id', $sell->user_id);
            }
        })
            ->where('id', '!=', $shipper->id)
            ->get()
            ->unique('id');

        $recipients->each(fn (User $mgr) => rescue(fn () => $mgr->notify(new SellShipmentNotification($sell, $shipper->name))));
    }
}

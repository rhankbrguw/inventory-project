<?php

namespace App\Services;

use App\Models\Purchase;
use App\Models\Role;
use App\Models\User;
use App\Notifications\PurchaseCreatedNotification;
use App\Notifications\PurchaseShipmentNotification;
use Illuminate\Support\Facades\DB;

class PurchaseFulfillmentService
{
    public function __construct(
        protected StockService $stockService,
        protected PurchaseCreationService $creationService
    ) {}

    /**
     * Mark a purchase as shipped and deduct stock from the source warehouse.
     */
    public function ship(Purchase $purchase, User $shipper): void
    {
        $purchase->loadMissing(['items.product', 'location', 'user']);

        DB::transaction(function () use ($purchase) {
            $purchase->update(['status' => Purchase::STATUS_SHIPPING]);

            foreach ($purchase->items->sortBy('product_id') as $item) {
                $this->stockService->stockOut(
                    product: $item->product,
                    locationId: $purchase->from_location_id,
                    qty: $item->quantity,
                    sellPrice: $item->cost_per_unit,
                    type: 'sell',
                    ref: $purchase,
                    notes: __('messages.stock.shipped_to', ['location' => $purchase->location->name])
                );
            }
        });

        $this->notifyDestinationManagersOfShipment($purchase, $shipper);
    }

    private function notifyDestinationManagersOfShipment(Purchase $purchase, User $shipper): void
    {
        $targetRoleIds = Role::whereIn('code', [Role::CODE_BRANCH_MGR, Role::CODE_WAREHOUSE_MGR])->pluck('id');
        $recipients = User::where(function ($query) use ($purchase, $targetRoleIds) {
            if ($targetRoleIds->isNotEmpty()) {
                $query->whereHas('locations', fn ($q) => $q->where('locations.id', $purchase->location_id)->whereIn('location_user.role_id', $targetRoleIds));
            }
            if ($purchase->user_id) {
                $query->orWhere('id', $purchase->user_id);
            }
        })
            ->where('id', '!=', $shipper->id)
            ->get()
            ->unique('id');

        $recipients->each(fn (User $mgr) => rescue(fn () => $mgr->notify(new PurchaseShipmentNotification($purchase, $shipper->name))));
    }

    /**
     * Mark a purchase as received and add stock to the destination location.
     */
    public function receive(Purchase $purchase, ?string $photoPath = null): void
    {
        $purchase->loadMissing(['items.product']);

        DB::transaction(function () use ($purchase, $photoPath) {
            $purchase->update([
                'status' => Purchase::STATUS_COMPLETED,
                'receipt_photo_path' => $photoPath,
            ]);
            $this->creationService->processStockIn($purchase);
        });
    }

    /**
     * Notify all warehouse managers at the source location.
     */
    public function notifyWarehouseManagers(Purchase $purchase, string $creatorName): void
    {
        if (! $purchase->from_location_id) {
            return;
        }

        $managerRoleIds = Role::whereIn('code', [Role::CODE_WAREHOUSE_MGR, Role::CODE_BRANCH_MGR])->pluck('id');

        User::whereHas('locations', fn ($q) => $q
            ->where('locations.id', $purchase->from_location_id)
            ->whereIn('location_user.role_id', $managerRoleIds)
        )->each(function (User $manager) use ($purchase, $creatorName) {
            rescue(fn () => $manager->notify(new PurchaseCreatedNotification($purchase, $creatorName)));
        });
    }
}

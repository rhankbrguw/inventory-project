<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Role;
use App\Models\Sell;
use App\Models\SellItem;
use App\Models\Type;
use App\Models\User;
use App\Notifications\SellCreatedNotification;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class SellCheckoutService
{
    public function __construct(
        protected StockService $stockService,
        protected InstallmentService $installmentService
    ) {}

    public function getCartItems(User $user): Collection
    {
        return $user->sellCartItems()->with(['product.prices', 'product.inventories', 'location', 'salesChannel'])->get();
    }

    public function createSell(User $user, array $sellAttributes, float $total, ?int $targetId, int $terms, float $rate, ?int $channelId, string $status): Sell
    {
        $typeId = Type::where('group', Type::GROUP_TRANSACTION)->where('code', Type::CODE_TRANSACTION_SELL)->value('id') ?? 0;

        return DB::transaction(function () use ($user, $sellAttributes, $total, $typeId, $targetId, $terms, $rate, $channelId, $status) {
            $sell = $this->insertSellRecord($user, $sellAttributes, $total, $typeId, $targetId, $terms, $rate, $channelId, $status);
            if ($terms > 1) {
                $this->installmentService->createSchedule($sell, $total, $terms, $sellAttributes['transaction_date'], $rate);
            }

            $this->processSellItems($sell, $sellAttributes, $status);
            $user->sellCartItems()->where('location_id', $sellAttributes['location_id'])->delete();

            if ($status === Sell::STATUS_PENDING_APPROVAL && $targetId) {
                $this->notifyManagersOfNewSell($sell, $user, $targetId);
            }

            return $sell;
        });
    }

    private function insertSellRecord(User $user, array $sellAttributes, float $total, int $typeId, ?int $targetId, int $terms, float $rate, ?int $channelId, string $status): Sell
    {
        $paymentTypeId = $sellAttributes['payment_method_type_id'] ?? null;
        $isCash = $paymentTypeId && Type::where('id', $paymentTypeId)->value('code') === Type::CODE_PAYMENT_TUNAI;
        $paymentStatus = ($terms === 1 && $isCash) ? Sell::PAYMENT_PAID : Sell::PAYMENT_PENDING;

        return Sell::create([
            'type_id' => $typeId, 'location_id' => $sellAttributes['location_id'], 'customer_id' => $sellAttributes['customer_id'] ?? null,
            'target_location_id' => $targetId, 'user_id' => $user->id, 'reference_code' => Sell::PREFIX.now()->format('YmdHis').'-'.bin2hex(random_bytes(2)),
            'transaction_date' => $sellAttributes['transaction_date'], 'total_price' => $total, 'status' => $status,
            'notes' => $sellAttributes['notes'] ?? null, 'sales_channel_type_id' => $channelId,
            'payment_method_type_id' => $paymentTypeId, 'installment_terms' => $terms,
            'interest_rate' => $rate, 'payment_status' => $paymentStatus,
        ]);
    }

    private function processSellItems(Sell $sell, array $sellAttributes, string $status): void
    {
        $items = collect($sellAttributes['items'])->sortBy('product_id')->all();
        $records = [];

        foreach ($items as $item) {
            $product = Product::withTrashed()->findOrFail($item['product_id']);
            $channelId = $item['sales_channel_id'] ?? null;
            $branchCost = DB::table('inventories')->where('product_id', $item['product_id'])->where('location_id', $sellAttributes['location_id'])->value('average_cost');
            $costPerUnit = (float) ($branchCost ?? ($product->average_cost ?? 0));
            $records[] = [
                'sell_id' => $sell->id, 'product_id' => $item['product_id'], 'sales_channel_type_id' => $channelId,
                'quantity' => $item['quantity'], 'sell_price' => $item['sell_price'], 'cost_per_unit' => $costPerUnit,
                'created_at' => now(), 'updated_at' => now(),
            ];
            if ($status !== Sell::STATUS_PENDING_APPROVAL) {
                $this->stockService->stockOut(product: $product, locationId: $sellAttributes['location_id'], qty: $item['quantity'], sellPrice: $item['sell_price'], type: 'sell', ref: $sell, notes: $sellAttributes['notes'] ?? null, channelId: $channelId);
            }
        }
        SellItem::insert($records);
    }

    private function notifyManagersOfNewSell(Sell $sell, User $user, int $targetLocationId): void
    {
        $managerRoleIds = Role::whereIn('code', [Role::CODE_BRANCH_MGR, Role::CODE_WAREHOUSE_MGR])->pluck('id');
        if ($managerRoleIds->isNotEmpty()) {
            User::whereHas('locations', fn ($q) => $q->where('locations.id', $targetLocationId)->whereIn('location_user.role_id', $managerRoleIds))
                ->where('id', '!=', $user->id)
                ->each(fn (User $target) => rescue(fn () => $target->notify(new SellCreatedNotification($sell, $user->name))));
        }
    }
}

<?php

namespace App\Services;

use App\Models\Purchase;
use App\Models\PurchaseItem;
use App\Models\Type;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class PurchaseCreationService
{
    public function __construct(
        protected StockService $stockService,
        protected InstallmentService $installmentService
    ) {}

    public function create(array $validated, int $userId, string $initialStatus): Purchase
    {
        $totalCost = collect($validated['items'])->sum(fn ($item) => $item['quantity'] * $item['cost_per_unit']);
        $purchaseType = Type::where('group', Type::GROUP_TRANSACTION)->where('code', Type::CODE_TRANSACTION_PURCHASE)->firstOrFail();

        return DB::transaction(function () use ($validated, $userId, $initialStatus, $totalCost, $purchaseType) {
            $purchase = $this->insertPurchaseRecord($validated, $userId, $initialStatus, $totalCost, $purchaseType->id);
            $this->insertPurchaseItems($purchase->id, $validated['items']);

            if (($validated['installment_terms'] ?? 1) > 1) {
                $this->installmentService->createSchedule($purchase, $totalCost, (int) $validated['installment_terms'], $validated['transaction_date'], (float) ($validated['interest_rate'] ?? 0));
            }

            if ($initialStatus === Purchase::STATUS_COMPLETED) {
                $this->processStockIn($purchase);
            }

            return $purchase;
        });
    }

    private function insertPurchaseRecord(array $validated, int $userId, string $initialStatus, float $totalCost, int $typeId): Purchase
    {
        $terms = $validated['installment_terms'] ?? 1;
        $paymentTypeId = $validated['payment_method_type_id'] ?? null;
        $isCash = $paymentTypeId && Type::where('id', $paymentTypeId)->value('code') === Type::CODE_PAYMENT_TUNAI;
        $paymentStatus = ($terms === 1 && $isCash) ? Purchase::PAYMENT_PAID : Purchase::PAYMENT_PENDING;

        return Purchase::create([
            'type_id' => $typeId,
            'location_id' => $validated['location_id'],
            'from_location_id' => $validated['from_location_id'] ?? null,
            'supplier_id' => $validated['supplier_id'],
            'user_id' => $userId,
            'reference_code' => Purchase::PREFIX.now()->format('Ymd-His'),
            'transaction_date' => Carbon::parse($validated['transaction_date'])->format('Y-m-d'),
            'notes' => $validated['notes'],
            'payment_method_type_id' => $paymentTypeId,
            'status' => $initialStatus,
            'total_cost' => $totalCost,
            'installment_terms' => $terms,
            'interest_rate' => (float) ($validated['interest_rate'] ?? 0),
            'payment_status' => $paymentStatus,
        ]);
    }

    private function insertPurchaseItems(int $purchaseId, array $items): void
    {
        $records = array_map(fn ($item) => [
            'purchase_id' => $purchaseId,
            'product_id' => $item['product_id'],
            'quantity' => $item['quantity'],
            'cost_per_unit' => $item['cost_per_unit'],
            'created_at' => now(),
            'updated_at' => now(),
        ], $items);

        PurchaseItem::insert($records);
    }

    public function processStockIn(Purchase $purchase): void
    {
        $purchase->loadMissing('items.product');
        foreach ($purchase->items->sortBy('product_id') as $item) {
            if (! $purchase->isInternal()) {
                $this->stockService->recalculateGlobalAverageCost($item->product, $item->quantity, $item->cost_per_unit);
            }
            $this->stockService->stockIn(
                product: $item->product,
                locationId: $purchase->location_id,
                qty: $item->quantity,
                cost: $item->cost_per_unit,
                type: 'purchase',
                ref: $purchase,
                notes: $purchase->notes
            );
        }
    }
}

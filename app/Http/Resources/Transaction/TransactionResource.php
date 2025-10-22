<?php

namespace App\Http\Resources\Transaction;

use App\Models\Purchase;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransactionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $isPurchase = $this->resource instanceof Purchase;

        $defaultSupplierName = $this->whenLoaded('stockMovements', function () {
            return $this->stockMovements->first()?->product?->defaultSupplier?->name;
        });

        $uniqueKey = ($isPurchase ? 'purchase-' : 'sell-') . $this->id;

        return [
            'id' => $this->id,
            'unique_key' => $uniqueKey,
            'reference_code' => $this->reference_code,
            'transaction_date' => $this->transaction_date?->toISOString(),
            'type' => $this->whenLoaded('type', fn () => $this->type?->name),
            'status' => $this->status,
            'total_amount' => $isPurchase ? $this->total_cost : $this->total_price,
            'notes' => $this->notes,
            'location' => $this->whenLoaded('location', fn () => $this->location?->name),
            'party_name' => $isPurchase
                ? $this->whenLoaded('supplier', fn() => $this->supplier?->name)
                : $this->whenLoaded('customer', fn() => $this->customer?->name ?? 'Pelanggan Umum'),
            'party_type' => $isPurchase ? 'Supplier' : 'Customer',
            'user' => $this->whenLoaded('user', fn () => $this->user?->name),
            'items_preview' => $this->whenLoaded('stockMovements', function () {
                return $this->stockMovements->take(2)->map(fn ($item) => $item->product?->name)->filter()->join(', ');
            }),
            'url' => $isPurchase
                ? route('transactions.purchases.show', $this->id)
                : route('transactions.sells.show', $this->id),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}

<?php

namespace App\Http\Resources\Transaction;

use App\Models\Purchase;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Http\Request;

class TransactionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $isPurchase = $this->resource instanceof Purchase;

        $defaultSupplierName = $this->whenLoaded('stockMovements', function () {
            return $this->stockMovements->first()?->product?->defaultSupplier?->name;
        });

        return [
            'id' => $this->id,
            'reference_code' => $this->reference_code,
            'status' => $this->status,
            'total_cost' => $isPurchase ? $this->total_cost : $this->total_price,
            'notes' => $this->notes,
            'transaction_date' => $this->transaction_date?->toISOString(),
            'type' => $this->whenLoaded('type', fn() => $this->type?->name),
            'location' => $this->whenLoaded('location', fn() => $this->location?->name),
            'user' => $this->whenLoaded('user', fn() => $this->user?->name),
            'default_supplier_name' => $defaultSupplierName,
            'items_preview' => $this->whenLoaded('stockMovements', function () {
                return $this->stockMovements->take(2)->map(fn($item) => $item->product?->name)->filter()->join(', ');
            }),
            'url' => $isPurchase
                ? route('transactions.purchases.show', $this->id)
                : route('transactions.sells.show', $this->id),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}

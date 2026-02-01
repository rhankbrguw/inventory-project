<?php

namespace App\Http\Resources\Transaction;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Http\Request;

class PurchaseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'reference_code' => $this->reference_code,
            'status' => $this->status,
            'total_cost' => $this->total_cost,
            'notes' => $this->notes,
            'transaction_date' => $this->transaction_date?->format('Y-m-d'),

            'installment_terms' => $this->installment_terms,
            'payment_status' => $this->payment_status,
            'has_installments' => $this->hasInstallments(),
            'is_fully_paid' => $this->isFullyPaid(),

            'is_internal' => $this->isInternal(),

            'location' => $this->whenLoaded('location', fn() => [
                'id' => $this->location->id,
                'name' => $this->location->name,
            ]),

            'from_location' => $this->whenLoaded('fromLocation', fn() => [
                'id' => $this->fromLocation->id,
                'name' => $this->fromLocation->name,
            ]),

            'supplier' => $this->whenLoaded('supplier', fn() => [
                'id' => $this->supplier->id,
                'name' => $this->supplier->name,
            ]),

            'user' => $this->whenLoaded('user', fn() => [
                'id' => $this->user->id,
                'name' => $this->user->name,
            ]),
            'approved_by' => $this->whenLoaded('approver', fn() => [
                'id' => $this->approver->id,
                'name' => $this->approver->name,
            ]),
            'rejected_by' => $this->whenLoaded('rejector', fn() => [
                'id' => $this->rejector->id,
                'name' => $this->rejector->name,
            ]),
            'rejection_reason' => $this->rejection_reason,
            'items' => $this->whenLoaded('items', function () {
                return $this->items->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'product' => [
                            'name' => $item->product->name ?? 'Produk Dihapus',
                            'sku' => $item->product->sku ?? '-',
                            'unit' => $item->product->unit ?? 'unit',
                        ],
                        'quantity' => (float) $item->quantity,
                        'cost_per_unit' => (float) $item->cost_per_unit,
                        'subtotal' => (float) ($item->quantity * $item->cost_per_unit),
                    ];
                });
            }),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}

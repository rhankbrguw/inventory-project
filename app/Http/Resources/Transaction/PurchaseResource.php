<?php

namespace App\Http\Resources\Transaction;

use App\Http\Resources\StockMovementResource;
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
            'transaction_date' => $this->transaction_date?->toISOString(),

            'installment_terms' => $this->installment_terms,
            'payment_status' => $this->payment_status,
            'has_installments' => $this->hasInstallments(),
            'is_fully_paid' => $this->isFullyPaid(),

            'location' => $this->whenLoaded('location', fn () => [
                'id' => $this->location->id,
                'name' => $this->location->name,
            ]),
            'supplier' => $this->whenLoaded('supplier', fn () => [
                'id' => $this->supplier->id,
                'name' => $this->supplier->name,
            ]),
            'user' => $this->whenLoaded('user', fn () => [
                'id' => $this->user->id,
                'name' => $this->user->name,
            ]),
            'payment_method' => $this->whenLoaded('paymentMethodType', fn () => [
                'id' => $this->paymentMethodType->id,
                'name' => $this->paymentMethodType->name,
            ]),

            'installments' => $this->whenLoaded('installments', function () {
                return $this->installments->map(fn ($inst) => [
                    'id' => $inst->id,
                    'installment_number' => $inst->installment_number,
                    'amount' => $inst->amount,
                    'due_date' => $inst->due_date?->toISOString(),
                    'status' => $inst->status,
                    'paid_date' => $inst->paid_date?->toISOString(),
                    'paid_amount' => $inst->paid_amount,
                    'is_paid' => $inst->isPaid(),
                    'is_overdue' => $inst->isOverdue(),
                ]);
            }),

            'items' => StockMovementResource::collection($this->whenLoaded('stockMovements')),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}

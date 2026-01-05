<?php

namespace App\Http\Resources\Transaction;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Http\Request;

class SellResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $totalSell = $this->items->sum(fn($i) => $i->quantity * $i->sell_price);
        $totalCost = $this->items->sum(fn($i) => $i->quantity * ($i->cost_per_unit ?? 0));
        $totalMargin = $totalSell - $totalCost;

        return [
            'id' => $this->id,
            'reference_code' => $this->reference_code,
            'total_price' => (float) $this->total_price,
            'status' => $this->status,
            'notes' => $this->notes,
            'transaction_date' => $this->transaction_date?->format('Y-m-d'),
            'installment_terms' => (int) $this->installment_terms,
            'payment_status' => $this->payment_status,

            'totals' => [
                'totalSell' => (float) $totalSell,
                'totalCost' => (float) $totalCost,
                'totalMargin' => (float) $totalMargin,
            ],

            'approved_by' => $this->approver ? [
                'id' => $this->approver->id,
                'name' => $this->approver->name,
            ] : null,
            'rejected_by' => $this->rejector ? [
                'id' => $this->rejector->id,
                'name' => $this->rejector->name,
            ] : null,
            'rejection_reason' => $this->rejection_reason,
            'has_installments' => $this->hasInstallments(),
            'is_fully_paid' => $this->isFullyPaid(),

            'type' => $this->whenLoaded('type', fn() => [
                'id' => $this->type->id,
                'name' => $this->type->name,
            ]),
            'location' => $this->whenLoaded('location', fn() => [
                'id' => $this->location->id,
                'name' => $this->location->name,
            ]),
            'customer' => $this->whenLoaded('customer', fn() => [
                'id' => $this->customer->id,
                'name' => $this->customer->name,
                'related_location_id' => $this->customer->related_location_id,
            ]),
            'sales_channel' => $this->whenLoaded('salesChannel', fn() => [
                'id' => $this->salesChannel->id,
                'name' => $this->salesChannel->name,
                'code' => $this->salesChannel->code,
            ]),
            'user' => $this->whenLoaded('user', fn() => [
                'id' => $this->user->id,
                'name' => $this->user->name,
            ]),
            'payment_method' => $this->whenLoaded('paymentMethod', fn() => [
                'id' => $this->paymentMethod->id,
                'name' => $this->paymentMethod->name,
            ]),
            'installments' => $this->whenLoaded('installments', function () {
                return $this->installments->map(fn($inst) => [
                    'id' => $inst->id,
                    'installment_number' => $inst->installment_number,
                    'amount' => (float) $inst->amount,
                    'due_date' => $inst->due_date?->toISOString(),
                    'status' => $inst->status,
                    'paid_date' => $inst->paid_date?->toISOString(),
                    'paid_amount' => (float) $inst->paid_amount,
                    'is_paid' => $inst->isPaid(),
                    'is_overdue' => $inst->isOverdue(),
                ]);
            }),

            'items' => $this->whenLoaded('items', function () {
                return $this->items->map(function ($item) {
                    $channelName = $item->salesChannel
                        ? $item->salesChannel->name
                        : ($this->salesChannel ? $this->salesChannel->name : '-');
                    return [
                        'id' => $item->id,
                        'product' => [
                            'name' => $item->product->name ?? 'Item Terhapus',
                            'sku' => $item->product->sku ?? '-',
                            'unit' => $item->product->unit ?? '',
                            'deleted_at' => $item->product->deleted_at ?? null,
                        ],
                        'channel_name' => $channelName,
                        'channel_code' => $item->salesChannel ? $item->salesChannel->code : ($this->salesChannel->code ?? null),
                        'product_name' => $item->product->name ?? 'Item Terhapus',
                        'unit' => $item->product->unit ?? '',
                        'quantity' => (float) $item->quantity,

                        'price' => (float) $item->sell_price,
                        'sell_price' => (float) $item->sell_price,
                        'average_cost_per_unit' => (float) ($item->cost_per_unit ?? 0),

                        'total' => (float) ($item->quantity * $item->sell_price),
                    ];
                });
            }),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}

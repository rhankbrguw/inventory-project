<?php

namespace App\Http\Resources\Transaction;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransferResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'reference_code' => $this->reference_code,
            'from_location' => [
                'id' => $this->fromLocation->id,
                'name' => $this->fromLocation->name,
            ],
            'to_location' => [
                'id' => $this->toLocation->id,
                'name' => $this->toLocation->name,
            ],
            'user' => [
                'id' => $this->user->id,
                'name' => $this->user->name,
            ],
            'transfer_date' => $this->transfer_date,
            'status' => $this->status,
            'notes' => $this->notes,
            'received_by' => $this->receivedBy ? [
                'id' => $this->receivedBy->id,
                'name' => $this->receivedBy->name,
            ] : null,
            'received_at' => $this->received_at,
            'rejected_by' => $this->rejectedBy ? [
                'id' => $this->rejectedBy->id,
                'name' => $this->rejectedBy->name,
            ] : null,
            'rejected_at' => $this->rejected_at,
            'rejection_reason' => $this->rejection_reason,
            'items' => $this->stockMovements()
                ->where('type', 'transfer_out')
                ->with(['product' => function ($q) {
                    $q->withTrashed();
                }])
                ->get()
                ->map(function ($movement) {
                    return [
                        'id' => $movement->id,
                        'product' => $movement->product ? [
                            'id' => $movement->product->id,
                            'name' => $movement->product->name,
                            'sku' => $movement->product->sku,
                            'unit' => $movement->product->unit,
                            'deleted_at' => $movement->product->deleted_at,
                        ] : null,
                        'quantity' => abs($movement->quantity),
                        'cost_per_unit' => $movement->cost_per_unit,
                    ];
                }),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}

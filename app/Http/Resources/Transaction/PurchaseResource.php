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
            'location' => $this->whenLoaded('location', fn() => [
                'id' => $this->location->id,
                'name' => $this->location->name,
            ]),
            'supplier' => $this->whenLoaded('supplier', fn() => [
                'id' => $this->supplier->id,
                'name' => $this->supplier->name,
            ]),
            'user' => $this->whenLoaded('user', fn() => [
                'id' => $this->user->id,
                'name' => $this->user->name,
            ]),
            'payment_method' => $this->whenLoaded('paymentMethodType', fn() => [
                'id' => $this->paymentMethodType->id,
                'name' => $this->paymentMethodType->name,
            ]),
            'items' => StockMovementResource::collection($this->whenLoaded('stockMovements')),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}

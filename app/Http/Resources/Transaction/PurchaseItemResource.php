<?php

namespace App\Http\Resources\Transaction;

use App\Http\Resources\ProductResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PurchaseItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'purchase_id' => $this->purchase_id,
            'product_id' => $this->product_id,
            'product' => new ProductResource($this->whenLoaded('product')),
            'quantity' => (float) $this->quantity,
            'cost_per_unit' => (float) $this->cost_per_unit,
            'subtotal' => (float) ($this->quantity * $this->cost_per_unit),
        ];
    }
}

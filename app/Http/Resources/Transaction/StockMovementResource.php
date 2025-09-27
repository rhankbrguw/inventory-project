<?php

namespace App\Http\Resources\Transaction;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StockMovementResource extends JsonResource
{
   public function toArray(Request $request): array
   {
      return [
         'id' => $this->id,
         'type' => $this->type,
         'quantity' => $this->quantity,
         'cost_per_unit' => $this->cost_per_unit,
         'notes' => $this->notes,
         'created_at' => $this->created_at->toISOString(),
         'reference' => $this->whenLoaded('purchase', fn() => $this->purchase?->reference_code),
         'product' => $this->whenLoaded('product', fn() => [
            'id' => $this->product->id,
            'name' => $this->product->name,
            'sku' => $this->product->sku,
            'unit' => $this->product->unit,
         ]),
      ];
   }
}

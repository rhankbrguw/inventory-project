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
         'product' => $this->whenLoaded('product', fn() => [
            'id' => $this->product->id,
            'name' => $this->product->name,
            'sku' => $this->product->sku,
            'unit' => $this->product->unit,
         ]),
         'location' => $this->whenLoaded('location', fn() => [
            'id' => $this->location->id,
            'name' => $this->location->name,
         ]),
         'supplier' => $this->whenLoaded('supplier', fn() => [
            'id' => $this->supplier->id,
            'name' => $this->supplier->name,
         ]),
         'purchase_reference' => $this->whenLoaded('purchase', fn() => $this->purchase?->reference_code),
         'created_at' => $this->created_at?->toISOString(),
         'updated_at' => $this->updated_at?->toISOString(),
      ];
   }
}

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
         'quantity' => $this->quantity,
         'cost_per_unit' => $this->cost_per_unit,
         'product' => $this->whenLoaded('product', fn() => [
            'id' => $this->product->id,
            'name' => $this->product->name,
            'sku' => $this->product->sku,
            'unit' => $this->product->unit,
         ]),
      ];
   }
}

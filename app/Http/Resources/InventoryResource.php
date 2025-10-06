<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InventoryResource extends JsonResource
{
   public function toArray(Request $request): array
   {
      $product = $this->product;
      $location = $this->location;

      return [
         'id' => $this->id,
         'quantity' => $this->quantity,
         'average_cost' => $this->average_cost,
         'product' => $product ? [
            'id' => $product->id,
            'name' => $product->name,
            'sku' => $product->sku,
            'unit' => $product->unit,
            'type' => $product->type ? [
               'id' => $product->type->id,
               'name' => $product->type->name,
            ] : null,
         ] : null,
         'location' => $location ? [
            'id' => $location->id,
            'name' => $location->name,
         ] : null,
         'created_at' => $this->created_at?->toISOString(),
         'updated_at' => $this->updated_at?->toISOString(),
      ];
   }
}

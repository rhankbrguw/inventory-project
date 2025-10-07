<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InventoryResource extends JsonResource
{
   public function toArray(Request $request): array
   {
      return [
         'id' => $this->id,
         'quantity' => $this->quantity,
         'average_cost' => $this->average_cost,
         'product' => ProductResource::make($this->whenLoaded('product')),
         'location' => $this->whenLoaded('location', fn() => [
            'id' => $this->location->id,
            'name' => $this->location->name,
            'type' => $this->location->type,
         ]),
         'created_at' => $this->created_at?->toISOString(),
         'updated_at' => $this->updated_at?->toISOString(),
      ];
   }
}

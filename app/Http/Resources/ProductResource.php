<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
   public function toArray(Request $request): array
   {
      return [
         'id' => $this->id,
         'name' => $this->name,
         'sku' => $this->sku,
         'price' => $this->price,
         'unit' => $this->unit,
         'description' => $this->description,
         'locations' => $this->whenLoaded('locations', function () {
            return $this->locations->pluck('id');
         }),
         'inventories' => $this->whenLoaded('inventories', function () {
            return $this->inventories->map(fn($inv) => [
               'quantity' => $inv->quantity,
               'location' => [
                  'id' => $inv->location->id,
                  'name' => $inv->location->name,
               ],
            ]);
         }),
      ];
   }
}

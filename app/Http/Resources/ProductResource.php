<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

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
         'image_url' => $this->image_path ? Storage::url($this->image_path) : null,
         'type' => $this->whenLoaded('type', function () {
            return [
               'id' => $this->type->id,
               'name' => $this->type->name,
            ];
         }),
         'default_supplier' => $this->whenLoaded('defaultSupplier', function () {
            return [
               'id' => $this->defaultSupplier->id,
               'name' => $this->defaultSupplier->name,
            ];
         }),
         'created_at' => $this->created_at?->toISOString(),
         'updated_at' => $this->updated_at?->toISOString(),
      ];
   }
}

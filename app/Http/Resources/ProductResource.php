<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'sku' => $this->sku,
            'description' => $this->description,
            'price' => $this->price,
            'unit' => $this->unit,
            'image_url' => $this->image_path ? Storage::url($this->image_path) : null,
            'channel_prices' => $this->whenLoaded('prices', function () {
                return $this->prices->pluck('price', 'type_id');
            }),
            'type' => $this->whenLoaded('type', fn () => [
                'id' => $this->type->id,
                'name' => $this->type->name,
            ]),
            'default_supplier' => $this->whenLoaded('defaultSupplier', fn () => [
                'id' => $this->defaultSupplier->id,
                'name' => $this->defaultSupplier->name,
            ]),
            'suppliers' => SupplierResource::collection($this->whenLoaded('suppliers')),
            'locations' => $this->when(
                isset($this->locations),
                $this->locations ?? []
            ),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
            'deleted_at' => $this->deleted_at?->toISOString(),
        ];
    }
}

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
            'id' => $this->id, 'location_id' => $this->location_id, 'name' => $this->name, 'sku' => $this->sku,
            'description' => $this->description, 'price' => (float) $this->effective_price, 'global_price' => (float) $this->price,
            'has_local_price' => $this->relationLoaded('inventories') && (bool) $this->inventories->first()?->selling_price,
            'unit' => $this->unit, 'image_url' => $this->image_path ? Storage::url($this->image_path) : null,
            'classification' => $this->when(array_key_exists('total_sold_30_days', $this->resource->getAttributes()), fn () => $this->classification),
            'channel_prices' => $this->whenLoaded('prices', fn () => $this->prices->pluck('price', 'type_id')),
            'type' => $this->whenLoaded('type', fn () => ['id' => $this->type->id, 'name' => $this->type->name]),
            'default_supplier' => $this->whenLoaded('defaultSupplier', fn () => ['id' => $this->defaultSupplier->id, 'name' => $this->defaultSupplier->name]),
            'suppliers' => SupplierResource::collection($this->whenLoaded('suppliers')),
            'locations' => $this->when(isset($this->locations), $this->locations ?? []),
            'created_at' => $this->created_at?->toISOString(), 'updated_at' => $this->updated_at?->toISOString(), 'deleted_at' => $this->deleted_at?->toISOString(),
        ];
    }
}

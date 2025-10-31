<?php

namespace App\Http\Resources\Transaction;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class PurchaseCartItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            "id" => $this->id,
            "quantity" => $this->quantity,
            "cost_per_unit" => $this->cost_per_unit,
            "product" => $this->whenLoaded(
                "product",
                fn() => [
                    "id" => $this->product->id,
                    "name" => $this->product->name,
                    "sku" => $this->product->sku,
                    "price" => $this->product->price,
                    "unit" => $this->product->unit,
                    "image_url" => $this->product->image_path
                        ? Storage::url($this->product->image_path)
                        : null,
                    "default_supplier_id" =>
                        $this->product->default_supplier_id,
                ],
            ),
            "supplier" => $this->whenLoaded(
                "supplier",
                fn() => [
                    "id" => $this->supplier->id,
                    "name" => $this->supplier->name,
                ],
            ),
            "user_id" => $this->user_id,
            "created_at" => $this->created_at?->toISOString(),
            "updated_at" => $this->updated_at?->toISOString(),
        ];
    }
}

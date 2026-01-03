<?php

namespace App\Http\Resources\Transaction;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class SellCartItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'quantity' => $this->quantity,
            'sell_price' => $this->sell_price,
            'product' => $this->whenLoaded(
                'product',
                fn() => [
                    'id' => $this->product->id,
                    'name' => $this->product->name,
                    'sku' => $this->product->sku,
                    'price' => $this->product->price,
                    'unit' => $this->product->unit,
                    'image_url' => $this->product->image_path
                        ? Storage::url($this->product->image_path)
                        : null,
                    'prices' => $this->product->prices ?? [],
                    'channel_prices' => $this->product->prices
                        ? $this->product->prices->pluck('price', 'sales_channel_id')
                        : [],
                ],
            ),
            'location' => $this->whenLoaded(
                "location",
                fn() => [
                    "id" => $this->location->id,
                    "name" => $this->location->name,
                ],
            ),
            'user_id' => $this->user_id,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}

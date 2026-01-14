<?php

namespace App\Http\Resources\Transaction;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class SellCartItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $user = $request->user();
        $effectivePrice = $this->product->price;

        if ($user && $user->level !== 1 && $this->product->relationLoaded('inventories')) {
            $locationId = $this->location_id;
            $inventory = $this->product->inventories->where('location_id', $locationId)->first();
            if ($inventory && $inventory->selling_price !== null && $inventory->selling_price > 0) {
                $effectivePrice = $inventory->selling_price;
            }
        }

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
                    'price' => $effectivePrice,
                    'unit' => $this->product->unit,
                    'image_url' => $this->product->image_path
                        ? Storage::url($this->product->image_path)
                        : null,
                    'prices' => $this->product->prices ?? [],
                    'channel_prices' => $this->product->prices
                        ? $this->product->prices->pluck('price', 'type_id')
                        : [],
                ],
            ),
            'sales_channel' => $this->whenLoaded(
                'salesChannel',
                fn() => [
                    'id' => $this->salesChannel->id,
                    'name' => $this->salesChannel->name,
                    'code' => $this->salesChannel->code,
                ]
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

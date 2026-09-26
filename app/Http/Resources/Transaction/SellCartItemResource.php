<?php

namespace App\Http\Resources\Transaction;

use App\Http\Resources\LocationResource;
use App\Http\Resources\ProductResource;
use App\Http\Resources\TypeResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SellCartItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id, 'product_id' => $this->product_id, 'location_id' => $this->location_id,
            'quantity' => (float) $this->quantity, 'sell_price' => (float) $this->sell_price,
            'total_price' => (float) ($this->quantity * $this->sell_price),
            'sales_channel_type_id' => $this->sales_channel_type_id,
            'product' => new ProductResource($this->whenLoaded('product')),
            'location' => new LocationResource($this->whenLoaded('location')),
            'sales_channel' => new TypeResource($this->whenLoaded('salesChannel')),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}

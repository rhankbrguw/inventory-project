<?php

namespace App\Http\Resources\Transaction;

use App\Http\Resources\ProductResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SellItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $qty = (float) $this->quantity;
        $sellPrice = (float) $this->sell_price;
        $costModal = (float) ($this->cost_per_unit ?? $this->product?->average_cost ?? 0);
        $channelName = $this->salesChannel?->name ?? ($this->sell?->salesChannel?->name ?? null);

        return [
            'id' => $this->id,
            'sell_id' => $this->sell_id,
            'product_id' => $this->product_id,
            'product' => new ProductResource($this->whenLoaded('product')),
            'channel_name' => $channelName ?? '-',
            'quantity' => $qty,
            'cost_per_unit' => $sellPrice,
            'average_cost_per_unit' => $costModal,
            'sell_price' => $sellPrice,
            'margin' => ($sellPrice - $costModal) * $qty,
            'total' => $qty * $sellPrice,
            'subtotal' => $qty * $sellPrice,
        ];
    }
}

<?php

namespace App\Http\Resources\Transaction;

use App\Http\Resources\UserResource;
use App\Models\Purchase;
use App\Models\StockTransfer;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Http\Request;

class StockMovementResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type,
            'reason' => $this->reason,
            'quantity' => $this->quantity,
            'cost_per_unit' => $this->cost_per_unit,
            'notes' => $this->notes,
            'reference' => $this->whenLoaded('reference', function () {
                if (!$this->reference) {
                    return null;
                }

                $code = $this->reference->reference_code ?? null;
                $url = '#';

                if ($this->reference instanceof Purchase) {
                    $url = route('transactions.purchases.show', $this->reference->id);
                }
                // else if ($this->reference instanceof StockTransfer) {
                //     $url = route('transactions.transfers.show', $this->reference->id);
                // }

                return [
                    'id' => $this->reference->id,
                    'code' => $code,
                    'url' => $url,
                ];
            }),
            'product' => $this->whenLoaded('product', fn() => [
                'id' => $this->product->id,
                'name' => $this->product->name,
                'sku' => $this->product->sku,
                'unit' => $this->product->unit,
            ]),
            'location' => $this->whenLoaded('location', fn() => [
                'id' => $this->location->id,
                'name' => $this->location->name,
            ]),
            'user' => UserResource::make($this->whenLoaded('user')),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}

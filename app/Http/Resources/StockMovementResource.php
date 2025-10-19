<?php

namespace App\Http\Resources;

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
            'origin_destination' => $this->getOriginDestination(),
            'reference' => $this->whenLoaded('reference', function () {
                if (!$this->reference) {
                    return null;
                }

                $code = $this->reference->reference_code ?? null;
                $url = '#';

                if ($this->reference instanceof Purchase) {
                    $url = route('transactions.purchases.show', $this->reference->id);
                }

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

    private function getOriginDestination(): ?array
    {
        if ($this->type === 'adjustment') {
            return [
                'label' => 'Catatan',
                'name' => $this->notes ?? '-',
            ];
        }

        return match ($this->type) {
            'purchase', 'transfer_in' => [
                'label' => 'Diterima dari',
                'name' => $this->type === 'purchase'
                    ? $this->reference?->supplier?->name
                    : $this->reference?->fromLocation?->name,
            ],
            'transfer_out' => [
                'label' => 'Dikirim ke',
                'name' => $this->reference?->toLocation?->name,
            ],
            default => null,
        };
    }
}

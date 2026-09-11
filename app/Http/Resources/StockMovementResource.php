<?php

namespace App\Http\Resources;

use App\Models\Purchase;
use App\Models\Sell;
use App\Models\StockTransfer;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StockMovementResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $locations = $this->getOriginDestination();
        $refCode = $this->getReferenceCode();
        $refUrl = $this->getReferenceUrl();

        return [
            'id' => $this->id, 'date' => $this->date ? ($this->date instanceof \DateTimeInterface ? $this->date->format('Y-m-d') : substr((string) $this->date, 0, 10)) : null,
            'type' => $this->type, 'quantity' => (float) $this->quantity,
            'cost_per_unit' => (float) $this->cost_per_unit, 'average_cost_per_unit' => (float) $this->average_cost_per_unit,
            'product' => new ProductResource($this->whenLoaded('product')),
            'location' => new LocationResource($this->whenLoaded('location')),
            'sales_channel' => $this->whenLoaded('salesChannel', fn () => $this->salesChannel ? ['id' => $this->salesChannel->id, 'name' => $this->salesChannel->name, 'code' => $this->salesChannel->code] : null),
            'from_location' => $locations['from'], 'to_location' => $locations['to'],
            'origin_destination' => $this->resolveOriginDestinationInfo(),
            'reference_type' => $this->reference_type ? class_basename($this->reference_type) : null,
            'reference_id' => $this->reference_id, 'reference_code' => $refCode,
            'reference' => ['code' => $refCode, 'url' => $refUrl],
            'notes' => $this->notes ?? ($this->reference?->notes ?? '-'),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }

    private function resolveOriginDestinationInfo(): ?array
    {
        if (! $this->relationLoaded('reference') || ! $this->reference) {
            return $this->notes ? ['type' => 'notes', 'label' => __('ui.notes'), 'name' => $this->notes] : null;
        }

        return match (true) {
            $this->reference instanceof StockTransfer => $this->resolveTransferInfo($this->reference),
            $this->reference instanceof Purchase => $this->resolvePurchaseInfo($this->reference),
            $this->reference instanceof Sell => $this->resolveSellInfo($this->reference),
            $this->reference instanceof User => ['type' => 'pic', 'label' => __('ui.pic'), 'name' => $this->reference->name.' - '.($this->notes ?? '-')],
            default => $this->notes ? ['type' => 'notes', 'label' => __('ui.notes'), 'name' => $this->notes] : null,
        };
    }

    private function resolveTransferInfo(StockTransfer $t): array
    {
        $from = $t->relationLoaded('fromLocation') ? $t->fromLocation?->name : null;
        $to = $t->relationLoaded('toLocation') ? $t->toLocation?->name : null;

        return ['type' => 'transfer', 'label' => __('ui.transfer'), 'name' => ($from && $to) ? "{$from} → {$to}" : ($this->notes ?? '-')];
    }

    private function resolvePurchaseInfo(Purchase $p): array
    {
        if ($p->from_location_id) {
            $loc = $p->relationLoaded('fromLocation') ? $p->fromLocation?->name : null;

            return ['type' => 'source_warehouse', 'label' => __('ui.source_warehouse'), 'name' => $loc ?? '-'];
        }
        $supp = $p->relationLoaded('supplier') ? $p->supplier?->name : null;

        return ['type' => 'supplier', 'label' => __('ui.supplier'), 'name' => $supp ?? '-'];
    }

    private function resolveSellInfo(Sell $s): array
    {
        if ($s->target_location_id) {
            $loc = $s->relationLoaded('targetLocation') ? $s->targetLocation?->name : null;

            return ['type' => 'target_warehouse', 'label' => __('ui.target_warehouse'), 'name' => $loc ?? '-'];
        }
        $cust = $s->relationLoaded('customer') ? $s->customer?->name : null;

        return ['type' => 'customer', 'label' => __('ui.customer'), 'name' => $cust ?? '-'];
    }

    private function getOriginDestination(): array
    {
        $from = null;
        $to = null;
        if ($this->relationLoaded('reference') && $this->reference) {
            if ($this->reference instanceof StockTransfer) {
                $from = ($this->reference->relationLoaded('fromLocation') && $this->reference->fromLocation) ? ['id' => $this->reference->fromLocation->id, 'name' => $this->reference->fromLocation->name] : null;
                $to = ($this->reference->relationLoaded('toLocation') && $this->reference->toLocation) ? ['id' => $this->reference->toLocation->id, 'name' => $this->reference->toLocation->name] : null;
            } elseif ($this->reference instanceof Purchase && $this->reference->from_location_id) {
                $from = ($this->reference->relationLoaded('fromLocation') && $this->reference->fromLocation) ? ['id' => $this->reference->fromLocation->id, 'name' => $this->reference->fromLocation->name] : null;
                $to = ($this->reference->relationLoaded('location') && $this->reference->location) ? ['id' => $this->reference->location->id, 'name' => $this->reference->location->name] : null;
            } elseif ($this->reference instanceof Sell && $this->reference->target_location_id) {
                $from = ($this->reference->relationLoaded('location') && $this->reference->location) ? ['id' => $this->reference->location->id, 'name' => $this->reference->location->name] : null;
                $to = ($this->reference->relationLoaded('targetLocation') && $this->reference->targetLocation) ? ['id' => $this->reference->targetLocation->id, 'name' => $this->reference->targetLocation->name] : null;
            }
        }

        return ['from' => $from, 'to' => $to];
    }

    private function getReferenceCode(): ?string
    {
        return ($this->relationLoaded('reference') && $this->reference) ? ($this->reference->reference_code ?? null) : null;
    }

    private function getReferenceUrl(): ?string
    {
        if (! $this->relationLoaded('reference') || ! $this->reference) {
            return null;
        }
        if ($this->reference instanceof Purchase) {
            return route('transactions.purchases.show', $this->reference->id);
        }
        if ($this->reference instanceof Sell) {
            return route('transactions.sells.show', $this->reference->id);
        }
        if ($this->reference instanceof StockTransfer) {
            return route('transactions.transfers.show', $this->reference->id);
        }

        return null;
    }
}

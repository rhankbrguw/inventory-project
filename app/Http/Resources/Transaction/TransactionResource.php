<?php

namespace App\Http\Resources\Transaction;

use App\Models\Purchase;
use App\Models\Role;
use App\Models\Sell;
use App\Models\StockTransfer;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransactionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $user = $request->user();
        $userLocIds = $user && $user->level !== Role::LEVEL_SUPER_ADMIN ? ($user->getAccessibleLocationIds() ?? []) : null;

        $type = $this->determineType($userLocIds);
        $date = $this->resolveDate();

        return [
            'id' => $this->id, 'unique_key' => "{$type}-{$this->id}", 'type' => $type,
            'reference_code' => $this->reference_code, 'url' => $this->resolveUrl(),
            'transaction_date' => $date ? $date->format('Y-m-d') : null,
            'total_amount' => (float) ($this->resource instanceof Purchase ? $this->total_cost : ($this->resource instanceof Sell ? $this->total_price : 0)),
            'status' => $this->status, 'party_name' => $this->resolvePartyName($userLocIds),
            'location' => $this->resolveLocationName($userLocIds), 'location_name' => $this->resolveLocationName($userLocIds),
            'target_location_name' => $this->resolveTargetLocationName($userLocIds),
            'user' => $this->user?->name ?? '-', 'user_name' => $this->user?->name ?? '-',
            'items_preview' => $this->whenLoaded('stockMovements', fn () => $this->stockMovements->map(fn ($m) => $m->product?->name)->filter()->values()->all()),
        ];
    }

    private function resolveDate()
    {
        return $this->resource instanceof StockTransfer
            ? ($this->transfer_date ?? $this->created_at)
            : ($this->transaction_date ?? $this->created_at);
    }

    private function resolveUrl(): string
    {
        return match (true) {
            $this->resource instanceof Purchase => route('transactions.purchases.show', $this->id),
            $this->resource instanceof Sell => route('transactions.sells.show', $this->id),
            $this->resource instanceof StockTransfer => route('transactions.transfers.show', $this->id),
            default => '#',
        };
    }

    private function determineType(?array $userLocIds): string
    {
        if ($this->resource instanceof StockTransfer) {
            return 'transfer';
        }
        if ($this->resource instanceof Purchase) {
            return ($this->resource->from_location_id && $userLocIds && in_array($this->resource->from_location_id, $userLocIds) && ! in_array($this->resource->location_id, $userLocIds)) ? 'sell' : 'purchase';
        }
        if ($this->resource instanceof Sell) {
            return ($this->resource->target_location_id && $userLocIds && in_array($this->resource->target_location_id, $userLocIds) && ! in_array($this->resource->location_id, $userLocIds)) ? 'purchase' : 'sell';
        }

        return 'unknown';
    }

    private function resolveLocationName(?array $userLocIds): ?string
    {
        if ($this->resource instanceof StockTransfer) {
            return $this->fromLocation?->name;
        }
        if ($this->resource instanceof Purchase) {
            return ($this->resource->from_location_id && $userLocIds && in_array($this->resource->from_location_id, $userLocIds) && ! in_array($this->resource->location_id, $userLocIds))
                ? $this->fromLocation?->name : $this->location?->name;
        }
        if ($this->resource instanceof Sell) {
            return ($this->resource->target_location_id && $userLocIds && in_array($this->resource->target_location_id, $userLocIds) && ! in_array($this->resource->location_id, $userLocIds))
                ? $this->targetLocation?->name : $this->location?->name;
        }

        return null;
    }

    private function resolveTargetLocationName(?array $userLocIds): ?string
    {
        return match (true) {
            $this->resource instanceof StockTransfer => $this->toLocation?->name,
            $this->resource instanceof Purchase => $this->fromLocation?->name,
            $this->resource instanceof Sell => $this->targetLocation?->name,
            default => null,
        };
    }

    private function resolvePartyName(?array $userLocIds): ?string
    {
        if ($this->resource instanceof StockTransfer) {
            return $this->toLocation?->name ?? '-';
        }
        if ($this->resource instanceof Purchase) {
            if ($this->resource->from_location_id) {
                return ($userLocIds && in_array($this->resource->from_location_id, $userLocIds) && ! in_array($this->resource->location_id, $userLocIds))
                    ? "Tujuan: {$this->resource->location?->name}" : "Sumber: {$this->resource->fromLocation?->name}";
            }

            return $this->supplier?->name ?? '-';
        }
        if ($this->resource instanceof Sell) {
            if ($this->resource->target_location_id) {
                return ($userLocIds && in_array($this->resource->target_location_id, $userLocIds) && ! in_array($this->resource->location_id, $userLocIds))
                    ? "Sumber: {$this->resource->location?->name}" : "Tujuan: {$this->resource->targetLocation?->name}";
            }

            return $this->customer?->name ?? '-';
        }

        return '-';
    }
}

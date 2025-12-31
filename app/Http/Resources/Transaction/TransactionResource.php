<?php

namespace App\Http\Resources\Transaction;

use App\Models\Purchase;
use App\Models\StockTransfer;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransactionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $isPurchase = $this->resource instanceof Purchase;
        $isTransfer = $this->resource instanceof StockTransfer;

        $uniqueKey = $isPurchase
            ? 'purchase-' . $this->id
            : ($isTransfer ? 'transfer-' . $this->id : 'sell-' . $this->id);

        $url = $isPurchase
            ? route('transactions.purchases.show', $this->id)
            : ($isTransfer
                ? route('transactions.transfers.show', $this->id)
                : route('transactions.sells.show', $this->id));

        $partyName = $isPurchase
            ? $this->whenLoaded('supplier', fn() => $this->supplier?->name)
            : ($isTransfer
                ? $this->whenLoaded('toLocation', fn() => $this->toLocation?->name)
                : $this->whenLoaded('customer', fn() => $this->customer?->name ?? 'Pelanggan Umum'));

        $partyType = $isPurchase ? 'Supplier' : ($isTransfer ? 'Lokasi Tujuan' : 'Customer');

        $type = $isTransfer
            ? 'Transfer'
            : ($this->whenLoaded('type', fn() => $this->type?->name) ?? null);

        $date = $isTransfer
            ? $this->transfer_date
            : $this->transaction_date;

        return [
            'id' => $this->id,
            'unique_key' => $uniqueKey,
            'reference_code' => $this->reference_code,

            'transaction_date' => $date?->format('Y-m-d'),

            'type' => $type,
            'status' => $isTransfer ? $this->status : 'completed',
            'total_amount' => $isPurchase ? $this->total_cost : ($isTransfer ? 0 : $this->total_price),
            'notes' => $this->notes,
            'location' => $this->whenLoaded('location', fn() => $this->location?->name) ?? $this->whenLoaded('fromLocation', fn() => $this->fromLocation?->name),
            'party_name' => $partyName,
            'party_type' => $partyType,
            'user' => $this->whenLoaded('user', fn() => $this->user?->name),
            'items_preview' => $this->whenLoaded('stockMovements', function () {
                return $this->stockMovements->take(2)->map(fn($item) => $item->product?->name)->filter()->join(', ');
            }),
            'url' => $url,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}

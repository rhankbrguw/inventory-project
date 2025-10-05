<?php

namespace App\Http\Resources\Transaction;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransactionResource extends JsonResource
{
   public function toArray(Request $request): array
   {
      return [
         'id' => $this->id,
         'reference_code' => $this->reference_code,
         'transaction_date' => $this->transaction_date,
         'total_cost' => $this->total_cost,
         'notes' => $this->notes,
         'status' => $this->status,
         'type' => 'Pembelian',
         'location' => $this->whenLoaded('location', fn() => $this->location?->name),
         'supplier' => $this->whenLoaded('supplier', fn() => $this->supplier?->name),
         'user' => $this->whenLoaded('user', fn() => $this->user?->name),
         'items_preview' => $this->whenLoaded('stockMovements', function () {
            return $this->stockMovements->take(2)->map(fn($item) => $item->product->name)->join(', ');
         }),
         'created_at' => $this->created_at?->toISOString(),
         'updated_at' => $this->updated_at?->toISOString(),
      ];
   }
}

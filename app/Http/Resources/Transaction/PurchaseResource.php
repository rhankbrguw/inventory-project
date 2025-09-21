<?php

namespace App\Http\Resources\Transaction;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PurchaseResource extends JsonResource
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
         'location' => $this->whenLoaded('location'),
         'supplier' => $this->whenLoaded('supplier'),
         'user' => $this->whenLoaded('user'),
         'items' => StockMovementResource::collection($this->whenLoaded('stockMovements')),
      ];
   }
}

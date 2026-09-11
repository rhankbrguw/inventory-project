<?php

namespace App\Http\Resources\Transaction;

use App\Http\Resources\LocationResource;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class TransferResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id, 'reference_code' => $this->reference_code,
            'transfer_date' => $this->transfer_date ? $this->transfer_date->format('Y-m-d') : null,
            'status' => $this->status, 'notes' => $this->notes,
            'receipt_photo_url' => $this->receipt_photo_path ? Storage::url($this->receipt_photo_path) : null,
            'receipt_photo_path' => $this->receipt_photo_path,
            'from_location' => new LocationResource($this->whenLoaded('fromLocation')),
            'to_location' => new LocationResource($this->whenLoaded('toLocation')),
            'user' => new UserResource($this->whenLoaded('user')),
            'receiver' => new UserResource($this->whenLoaded('receiver')),
            'rejector' => new UserResource($this->whenLoaded('rejector')),
            'items' => $this->whenLoaded('items', function () {
                return $this->items->where('type', 'transfer_out')->map(fn ($item) => [
                    'id' => $item->id,
                    'product_id' => $item->product_id,
                    'quantity' => abs($item->quantity),
                    'product' => $item->product ? [
                        'id' => $item->product->id,
                        'name' => $item->product->name,
                        'sku' => $item->product->sku,
                        'unit' => $item->product->unit,
                        'price' => $item->product->price,
                    ] : null,
                ])->values();
            }),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}

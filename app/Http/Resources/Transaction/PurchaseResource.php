<?php

namespace App\Http\Resources\Transaction;

use App\Http\Resources\LocationResource;
use App\Http\Resources\SupplierResource;
use App\Http\Resources\TypeResource;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class PurchaseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id, 'reference_code' => $this->reference_code,
            'transaction_date' => $this->transaction_date ? $this->transaction_date->format('Y-m-d') : null,
            'status' => $this->status, 'total_cost' => (float) $this->total_cost, 'notes' => $this->notes,
            'payment_status' => $this->getEffectivePaymentStatus(), 'installment_terms' => (int) $this->installment_terms,
            'has_installments' => $this->hasInstallments(), 'is_fully_paid' => $this->isFullyPaid(),
            'interest_rate' => (float) $this->interest_rate, 'interest_amount' => $this->interestAmount(),
            'total_payable' => $this->totalPayable(), 'receipt_photo_url' => $this->receipt_photo_path ? Storage::url($this->receipt_photo_path) : null,
            'receipt_photo_path' => $this->receipt_photo_path,
            'is_internal' => $this->isInternal(), 'location' => new LocationResource($this->whenLoaded('location')),
            'from_location' => new LocationResource($this->whenLoaded('fromLocation')),
            'supplier' => new SupplierResource($this->whenLoaded('supplier')),
            'user' => new UserResource($this->whenLoaded('user')),
            'approver' => new UserResource($this->whenLoaded('approver')),
            'rejector' => new UserResource($this->whenLoaded('rejector')),
            'payment_method' => new TypeResource($this->whenLoaded('paymentMethod')),
            'payment_method_type' => new TypeResource($this->whenLoaded('paymentMethod')),
            'items' => PurchaseItemResource::collection($this->whenLoaded('items')),
            'installments' => $this->whenLoaded('installments'),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}

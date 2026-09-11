<?php

namespace App\Http\Resources\Transaction;

use App\Http\Resources\CustomerResource;
use App\Http\Resources\LocationResource;
use App\Http\Resources\TypeResource;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class SellResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id, 'reference_code' => $this->reference_code,
            'transaction_date' => $this->transaction_date ? $this->transaction_date->format('Y-m-d') : null,
            'status' => $this->status, 'total_price' => (float) $this->total_price, 'notes' => $this->notes,
            'payment_status' => $this->getEffectivePaymentStatus(), 'installment_terms' => (int) $this->installment_terms,
            'has_installments' => $this->hasInstallments(), 'is_fully_paid' => $this->isFullyPaid(),
            'interest_rate' => (float) $this->interest_rate, 'interest_amount' => $this->interestAmount(),
            'total_payable' => $this->totalPayable(), 'receipt_photo_url' => $this->receipt_photo_path ? Storage::url($this->receipt_photo_path) : null,
            'receipt_photo_path' => $this->receipt_photo_path,
            'is_inter_branch' => $this->isInterBranchSale(), 'location' => new LocationResource($this->whenLoaded('location')),
            'target_location' => new LocationResource($this->whenLoaded('targetLocation')),
            'customer' => new CustomerResource($this->whenLoaded('customer')),
            'sales_channel' => new TypeResource($this->whenLoaded('salesChannel')),
            'user' => new UserResource($this->whenLoaded('user')),
            'approver' => new UserResource($this->whenLoaded('approver')),
            'rejector' => new UserResource($this->whenLoaded('rejector')),
            'payment_method' => new TypeResource($this->whenLoaded('paymentMethod')),
            'items' => SellItemResource::collection($this->whenLoaded('items')),
            'installments' => $this->whenLoaded('installments'),
            'totals' => $this->calculateTotals(),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }

    private function calculateTotals(): array
    {
        $items = $this->relationLoaded('items') ? $this->items : collect();
        $totalSell = (float) $this->total_price;
        $totalCost = (float) $items->sum(fn ($i) => ($i->cost_per_unit ?? ($i->product?->average_cost ?? 0)) * $i->quantity);

        return ['totalSell' => $totalSell, 'totalCost' => $totalCost, 'totalMargin' => $totalSell - $totalCost];
    }
}

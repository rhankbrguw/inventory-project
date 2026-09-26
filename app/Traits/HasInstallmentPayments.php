<?php

namespace App\Traits;

use App\Models\Installment;
use Illuminate\Database\Eloquent\Relations\MorphMany;

trait HasInstallmentPayments
{
    public function installments(): MorphMany
    {
        return $this->morphMany(Installment::class, 'installmentable');
    }

    public function hasInstallments(): bool
    {
        return $this->installment_terms > 1;
    }

    public function isFullyPaid(): bool
    {
        return $this->payment_status === self::PAYMENT_PAID;
    }

    public function isPending(): bool
    {
        return $this->payment_status === self::PAYMENT_PENDING;
    }

    public function isPartiallyPaid(): bool
    {
        return $this->payment_status === self::PAYMENT_PARTIAL;
    }

    public function getEffectivePaymentStatus(): string
    {
        if ($this->installment_terms > 1 && $this->relationLoaded('installments') && ($total = $this->installments->count()) > 0) {
            $paid = $this->installments->where('status', Installment::STATUS_PAID)->count();

            return match (true) {
                $paid === $total => self::PAYMENT_PAID,
                $paid > 0 => self::PAYMENT_PARTIAL,
                default => self::PAYMENT_PENDING,
            };
        }

        return $this->payment_status ?? self::PAYMENT_PENDING;
    }
}

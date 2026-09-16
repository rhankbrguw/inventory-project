<?php

namespace App\Services\Payment;

use App\Enums\PaymentStatus;
use App\Models\Installment;
use App\Models\PaymentTransaction;
use App\Models\Purchase;
use App\Models\Sell;
use Illuminate\Support\Facades\DB;

class PaymentSettlementService
{
    public function settle(PaymentTransaction $transaction): void
    {
        if (! $transaction->isSuccess()) {
            return;
        }

        DB::transaction(function () use ($transaction) {
            $payable = $transaction->payable()->lockForUpdate()->first();
            if (! $payable) {
                return;
            }

            if ($payable instanceof Sell) {
                $this->settleSell($payable, $transaction);
            } elseif ($payable instanceof Purchase) {
                $this->settlePurchase($payable, $transaction);
            } elseif ($payable instanceof Installment) {
                $this->settleInstallment($payable, $transaction);
            }
        });
    }

    private function settleSell(Sell $sell, PaymentTransaction $transaction): void
    {
        $sell->update(['payment_status' => PaymentStatus::PAID->value]);
        $sell->installments()->where('status', '!=', PaymentStatus::PAID->value)->update([
            'status' => PaymentStatus::PAID->value,
            'paid_date' => now()->toDateString(),
            'paid_amount' => DB::raw('amount'),
            'notes' => 'Settled via '.strtoupper($transaction->driver),
        ]);
    }

    private function settlePurchase(Purchase $purchase, PaymentTransaction $transaction): void
    {
        $purchase->update(['payment_status' => PaymentStatus::PAID->value]);
        $purchase->installments()->where('status', '!=', PaymentStatus::PAID->value)->update([
            'status' => PaymentStatus::PAID->value,
            'paid_date' => now()->toDateString(),
            'paid_amount' => DB::raw('amount'),
            'notes' => 'Settled via '.strtoupper($transaction->driver),
        ]);
    }

    private function settleInstallment(Installment $installment, PaymentTransaction $transaction): void
    {
        $installment->update([
            'status' => PaymentStatus::PAID->value,
            'paid_date' => now()->toDateString(),
            'paid_amount' => $transaction->gross_amount,
            'notes' => 'Paid via '.strtoupper($transaction->driver),
        ]);

        $parent = $installment->installmentable()->lockForUpdate()->first();
        if ($parent) {
            $unpaidExists = $parent->installments()->where('status', '!=', PaymentStatus::PAID->value)->exists();
            $parent->update(['payment_status' => $unpaidExists ? PaymentStatus::PARTIAL->value : PaymentStatus::PAID->value]);
        }
    }
}

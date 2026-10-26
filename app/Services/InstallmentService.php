<?php

namespace App\Services;

use App\Models\Installment;
use App\Models\Purchase;
use App\Models\Sell;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class InstallmentService
{
    public function createSchedule(Model $payable, float $principal, int $terms, mixed $startDate, float $rate = 0.0): void
    {
        $interest = round($principal * ($rate / 100) * $terms);
        $totalPayable = round($principal + $interest);
        $unit = $totalPayable >= 1000 ? 1000 : ($totalPayable >= 100 ? 100 : 1);
        $baseAmount = floor(($totalPayable / $terms) / $unit) * $unit;
        $totalAssigned = 0.0;

        for ($i = 1; $i <= $terms; $i++) {
            $amount = ($i === $terms) ? round($totalPayable - $totalAssigned, 2) : $baseAmount;
            $totalAssigned += $amount;
            $this->createTermInstallment($payable, $i, $amount, $startDate);
        }
    }

    private function createTermInstallment(Model $payable, int $termNum, float $amount, mixed $startDate): void
    {
        $payable->installments()->create([
            'installment_number' => $termNum, 'amount' => $amount,
            'due_date' => Carbon::parse($startDate)->addMonths($termNum - 1),
            'status' => Installment::STATUS_PENDING,
        ]);
    }

    public function pay(Installment $installment, float $paidAmount, string $paidDate): void
    {
        DB::transaction(function () use ($installment, $paidAmount, $paidDate) {
            $installment->update(['status' => Installment::STATUS_PAID, 'paid_amount' => $paidAmount, 'paid_date' => $paidDate]);
            $parent = $installment->installmentable()->first();
            if ($parent) {
                $this->reconcilePaymentStatus($parent);
            }
        });
    }

    public function markOverdue(): int
    {
        return Installment::where('status', Installment::STATUS_PENDING)->whereDate('due_date', '<', now()->startOfDay())->update(['status' => Installment::STATUS_OVERDUE]);
    }

    private function reconcilePaymentStatus(Model $payable): void
    {
        $installments = $payable->installments()->get(['status']);
        $total = $installments->count();
        $paidCount = $installments->where('status', Installment::STATUS_PAID)->count();

        [$paid, $partial, $pending] = $payable instanceof Purchase
            ? [Purchase::PAYMENT_PAID, Purchase::PAYMENT_PARTIAL, Purchase::PAYMENT_PENDING]
            : [Sell::PAYMENT_PAID, Sell::PAYMENT_PARTIAL, Sell::PAYMENT_PENDING];

        $newStatus = match (true) {
            $paidCount === $total => $paid, $paidCount > 0 => $partial, default => $pending
        };
        $payable->update(['payment_status' => $newStatus]);
    }
}

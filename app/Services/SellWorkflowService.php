<?php

namespace App\Services;

use App\Models\Installment;
use App\Models\Sell;
use App\Models\User;
use App\Notifications\SellAcceptedNotification;
use App\Notifications\SellRejectedNotification;

class SellWorkflowService
{
    public function approve(Sell $sell, User $approver): void
    {
        $sell->update([
            'status' => Sell::STATUS_APPROVED,
            'approved_by' => $approver->id,
            'approved_at' => now(),
        ]);

        $sell->loadMissing('user');
        if ($sell->user && $sell->user->id !== $approver->id) {
            $sell->user->notify(new SellAcceptedNotification($sell, $approver->name));
        }
    }

    public function reject(Sell $sell, User $rejector, string $reason): void
    {
        $sell->update([
            'status' => Sell::STATUS_REJECTED,
            'rejected_by' => $rejector->id,
            'rejected_at' => now(),
            'rejection_reason' => $reason,
        ]);

        $sell->loadMissing('user');
        if ($sell->user && $sell->user->id !== $rejector->id) {
            $sell->user->notify(new SellRejectedNotification($sell, $rejector->name, $reason));
        }
    }

    public function isPaymentSufficientForShipment(Sell $sell): bool
    {
        if ($sell->isFullyPaid() || $sell->payment_status === Sell::PAYMENT_PAID) {
            return true;
        }

        if ($sell->hasInstallments()) {
            return $sell->installments()->where('status', Installment::STATUS_PAID)->exists();
        }

        return false;
    }
}

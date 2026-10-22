<?php

namespace App\Services;

use App\Models\Installment;
use App\Models\Purchase;
use App\Models\User;
use App\Notifications\PurchaseAcceptedNotification;
use App\Notifications\PurchaseRejectedNotification;

class PurchaseWorkflowService
{
    public function approve(Purchase $purchase, User $approver): void
    {
        $purchase->update([
            'status' => Purchase::STATUS_APPROVED,
            'approved_by' => $approver->id,
            'approved_at' => now(),
        ]);

        $purchase->loadMissing('user');
        if ($purchase->user && $purchase->user_id !== $approver->id) {
            $purchase->user->notify(new PurchaseAcceptedNotification($purchase, $approver->name));
        }
    }

    public function reject(Purchase $purchase, User $rejector, string $reason): void
    {
        $purchase->update([
            'status' => Purchase::STATUS_REJECTED,
            'rejected_by' => $rejector->id,
            'rejected_at' => now(),
            'rejection_reason' => $reason,
        ]);

        $purchase->loadMissing('user');
        if ($purchase->user && $purchase->user_id !== $rejector->id) {
            $purchase->user->notify(new PurchaseRejectedNotification($purchase, $rejector->name, $reason));
        }
    }

    public function isPaymentSufficientForShipment(Purchase $purchase): bool
    {
        if (! $purchase->isInternal()) {
            return true;
        }

        if ($purchase->isFullyPaid() || $purchase->payment_status === Purchase::PAYMENT_PAID) {
            return true;
        }

        if ($purchase->hasInstallments()) {
            return $purchase->installments()->where('status', Installment::STATUS_PAID)->exists();
        }

        return false;
    }
}

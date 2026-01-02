<?php

namespace App\Policies;

use App\Models\Purchase;
use App\Models\User;
use App\Models\Role;
use Illuminate\Auth\Access\HandlesAuthorization;

class PurchasePolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return Role::isOperational($user->level);
    }

    public function view(User $user, Purchase $purchase): bool
    {
        if (Role::isSuperAdmin($user->level)) {
            return true;
        }
        return in_array($purchase->location_id, $user->getAccessibleLocationIds() ?? []);
    }

    public function create(User $user): bool
    {
        return Role::isManagerial($user->level);
    }

    public function createAtLocation(User $user, $locationId): bool
    {
        return $user->canTransactAtLocation($locationId, 'purchase');
    }

    public function update(User $user, Purchase $purchase): bool
    {
        if ($purchase->status !== 'Pending') {
            return false;
        }
        return $user->canTransactAtLocation($purchase->location_id, 'purchase');
    }

    public function delete(User $user, Purchase $purchase): bool
    {
        if ($purchase->status !== 'Pending') {
            return false;
        }
        return $user->canTransactAtLocation($purchase->location_id, 'purchase');
    }
}

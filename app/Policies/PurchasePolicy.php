<?php

namespace App\Policies;

use App\Models\Purchase;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class PurchasePolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->level <= 20 && $user->roles->first()?->code !== 'CSH';
    }

    public function view(User $user, Purchase $purchase): bool
    {
        if ($user->level === 1) {
            return true;
        }

        return $user->level <= 20 &&
            $user->roles->first()?->code !== 'CSH' &&
            in_array($purchase->location_id, $user->getAccessibleLocationIds() ?? []);
    }

    public function create(User $user): bool
    {
        return $user->level <= 20 && $user->roles->first()?->code !== 'CSH';
    }

    public function createAtLocation(User $user, $locationId): bool
    {
        if ($user->level === 1) {
            return true;
        }

        return $user->canActAsRoleAtLocation($locationId, ['WHM', 'BRM']);
    }

    public function update(User $user, Purchase $purchase): bool
    {
        if ($purchase->status !== 'Pending') {
            return false;
        }

        if ($user->level === 1) {
            return true;
        }

        return $user->canActAsRoleAtLocation($purchase->location_id, ['WHM', 'BRM']);
    }

    public function delete(User $user, Purchase $purchase): bool
    {
        if ($purchase->status !== 'Pending') {
            return false;
        }

        if ($user->level === 1) {
            return true;
        }

        return $user->canActAsRoleAtLocation($purchase->location_id, ['WHM', 'BRM']);
    }
}

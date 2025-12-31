<?php

namespace App\Policies;

use App\Models\Sell;
use App\Models\User;
use App\Models\Role;
use Illuminate\Auth\Access\HandlesAuthorization;

class SellPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return Role::isOperational($user->level);
    }

    public function view(User $user, Sell $sell): bool
    {
        if (Role::isSuperAdmin($user->level)) {
            return true;
        }
        return in_array($sell->location_id, $user->getAccessibleLocationIds() ?? []);
    }

    public function create(User $user): bool
    {
        return Role::isOperational($user->level);
    }

    public function createAtLocation(User $user, $locationId): bool
    {
        return $user->canTransactAtLocation($locationId, 'sell');
    }

    public function update(User $user, Sell $sell): bool
    {
        if ($sell->status !== 'Pending') {
            return false;
        }
        return $user->canTransactAtLocation($sell->location_id, 'sell');
    }

    public function delete(User $user, Sell $sell): bool
    {
        if ($sell->status !== 'Pending') {
            return false;
        }
        return $user->canTransactAtLocation($sell->location_id, 'sell');
    }
}

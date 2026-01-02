<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Role;
use Illuminate\Auth\Access\HandlesAuthorization;

class StockPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return Role::isOperational($user->level);
    }

    public function view(User $user, $stock): bool
    {
        if (Role::isSuperAdmin($user->level)) {
            return true;
        }
        return in_array($stock->location_id, $user->getAccessibleLocationIds() ?? []);
    }

    public function adjust(User $user, $locationId): bool
    {
        if (Role::isSuperAdmin($user->level)) {
            return true;
        }

        $role = $user->getRoleAtLocation($locationId);
        return $role && Role::isManagerial($role->level);
    }
}

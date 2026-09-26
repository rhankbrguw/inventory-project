<?php

namespace App\Policies;

use App\Models\Role;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class StockPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return Role::isOperational($user->level);
    }

    public function view(\App\Models\User $user, mixed $stock): bool
    {
        if (Role::isSuperAdmin($user->level)) {
            return true;
        }

        return in_array($stock->location_id, $user->getAccessibleLocationIds() ?? []);
    }

    public function adjust(\App\Models\User $user, ?int $locationId): bool
    {
        if (Role::isSuperAdmin($user->level)) {
            return true;
        }

        $role = $user->getRoleAtLocation($locationId);

        return $role && Role::isManagerial($role->level);
    }
}

<?php

namespace App\Policies;

use App\Models\Location;
use App\Models\User;
use App\Models\Role;
use Illuminate\Auth\Access\HandlesAuthorization;

class LocationPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return Role::isManagerial($user->level);
    }

    public function view(User $user, Location $location): bool
    {
        if (Role::isSuperAdmin($user->level)) {
            return true;
        }

        return Role::isManagerial($user->level) &&
            in_array($location->id, $user->getAccessibleLocationIds() ?? []);
    }

    public function create(User $user): bool
    {
        return Role::isSuperAdmin($user->level);
    }

    public function update(User $user): bool
    {
        return Role::isSuperAdmin($user->level);
    }

    public function delete(User $user): bool
    {
        return Role::isSuperAdmin($user->level);
    }

    public function restore(User $user): bool
    {
        return Role::isSuperAdmin($user->level);
    }

    public function forceDelete(User $user): bool
    {
        return Role::isSuperAdmin($user->level);
    }
}

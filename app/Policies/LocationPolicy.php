<?php

namespace App\Policies;

use App\Models\Location;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class LocationPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->level === 1 || in_array($user->roles->first()?->code, ['WHM', 'BRM']);
    }

    public function view(User $user, Location $location): bool
    {
        if ($user->level === 1) {
            return true;
        }

        return in_array($user->roles->first()?->code, ['WHM', 'BRM']) &&
            in_array($location->id, $user->getAccessibleLocationIds() ?? []);
    }

    public function create(User $user): bool
    {
        return $user->level === 1;
    }

    public function update(User $user, Location $location): bool
    {
        return $user->level === 1;
    }

    public function delete(User $user, Location $location): bool
    {
        return $user->level === 1;
    }

    public function restore(User $user, Location $location): bool
    {
        return $user->level === 1;
    }

    public function forceDelete(User $user, Location $location): bool
    {
        return $user->level === 1;
    }
}

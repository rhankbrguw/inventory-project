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
        return $user->level <= 10;
    }

    public function view(User $user, Location $location): bool
    {
        if ($user->level === 1) {
            return true;
        }

        return $user->level <= 10 &&
            in_array($location->id, $user->getAccessibleLocationIds() ?? []);
    }

    public function create(User $user): bool
    {
        return $user->level === 1;
    }

    public function update(User $user): bool
    {
        return $user->level === 1;
    }

    public function delete(User $user): bool
    {
        return $user->level === 1;
    }

    public function restore(User $user): bool
    {
        return $user->level === 1;
    }

    public function forceDelete(User $user): bool
    {
        return $user->level === 1;
    }
}

<?php

namespace App\Policies;

use App\Models\Sell;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class SellPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->level <= 20 && $user->roles->first()?->code !== 'WHM';
    }

    public function view(User $user, Sell $sell): bool
    {
        if ($user->level === 1) {
            return true;
        }

        if ($user->roles->first()?->code === 'WHM') {
            return false;
        }

        return $user->level <= 20 &&
            in_array($sell->location_id, $user->getAccessibleLocationIds() ?? []);
    }

    public function create(User $user): bool
    {
        if ($user->level === 1) {
            return true;
        }

        return $user->level <= 20 && $user->roles->first()?->code !== 'WHM';
    }

    public function createAtLocation(User $user, $locationId): bool
    {
        if ($user->level === 1) {
            return true;
        }

        return $user->hasRoleAtLocation($locationId, ['BRM', 'CSH']);
    }

    public function update(User $user, Sell $sell): bool
    {
        if ($sell->status !== 'Pending') {
            return false;
        }

        if ($user->level === 1) {
            return true;
        }

        return $user->hasRoleAtLocation($sell->location_id, ['BRM', 'CSH']);
    }

    public function delete(User $user, Sell $sell): bool
    {
        if ($sell->status !== 'Pending') {
            return false;
        }

        if ($user->level === 1) {
            return true;
        }

        return $user->hasRoleAtLocation($sell->location_id, ['BRM', 'CSH']);
    }
}

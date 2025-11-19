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
        return $user->level === 1 || in_array($user->roles->first()?->code, ['BRM', 'CSH']);
    }

    public function view(User $user, Sell $sell): bool
    {
        if ($user->level === 1) {
            return true;
        }

        return in_array($user->roles->first()?->code, ['BRM', 'CSH']) &&
            in_array($sell->location_id, $user->getAccessibleLocationIds() ?? []);
    }

    public function create(User $user): bool
    {
        return $user->level === 1 || in_array($user->roles->first()?->code, ['BRM', 'CSH']);
    }

    public function update(User $user, Sell $sell): bool
    {
        if ($sell->status !== 'Pending') {
            return false;
        }

        if ($user->level === 1) {
            return true;
        }

        return in_array($user->roles->first()?->code, ['BRM', 'CSH']) &&
            in_array($sell->location_id, $user->getAccessibleLocationIds() ?? []);
    }

    public function delete(User $user, Sell $sell): bool
    {
        if ($sell->status !== 'Pending') {
            return false;
        }

        if ($user->level === 1) {
            return true;
        }

        return in_array($user->roles->first()?->code, ['BRM', 'CSH']) &&
            in_array($sell->location_id, $user->getAccessibleLocationIds() ?? []);
    }
}

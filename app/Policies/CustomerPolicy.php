<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class CustomerPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->level <= 20 && $user->roles->first()?->code !== 'WHM';
    }

    public function view(User $user): bool
    {
        if ($user->level === 1) {
            return true;
        }

        if ($user->roles->first()?->code === 'WHM') {
            return false;
        }

        return $user->level <= 20;
    }

    public function create(User $user): bool
    {
        if ($user->level === 1) {
            return true;
        }

        return $user->level <= 10 && $user->roles->first()?->code === 'BRM';
    }

    public function update(User $user): bool
    {
        if ($user->level === 1) {
            return true;
        }

        return $user->level <= 10 && $user->roles->first()?->code === 'BRM';
    }

    public function delete(User $user): bool
    {
        if ($user->level === 1) {
            return true;
        }

        return $user->level <= 10 && $user->roles->first()?->code === 'BRM';
    }

    public function restore(User $user): bool
    {
        if ($user->level === 1) {
            return true;
        }

        return $user->level <= 10 && $user->roles->first()?->code === 'BRM';
    }
}

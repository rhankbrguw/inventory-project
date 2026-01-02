<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Role;
use Illuminate\Auth\Access\HandlesAuthorization;

class ProductPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return Role::isOperational($user->level);
    }

    public function view(User $user): bool
    {
        return Role::isOperational($user->level);
    }

    public function create(User $user): bool
    {
        return Role::isManagerial($user->level);
    }

    public function update(User $user): bool
    {
        return Role::isManagerial($user->level);
    }

    public function delete(User $user): bool
    {
        return Role::isManagerial($user->level);
    }

    public function restore(User $user): bool
    {
        return Role::isManagerial($user->level);
    }
}

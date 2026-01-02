<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Role;
use Illuminate\Auth\Access\HandlesAuthorization;

class UserPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return Role::isSuperAdmin($user->level);
    }

    public function view(User $user, User $model): bool
    {
        return Role::isSuperAdmin($user->level) || $user->id === $model->id;
    }

    public function create(User $user): bool
    {
        return Role::isSuperAdmin($user->level);
    }

    public function update(User $user, User $model): bool
    {
        if ($user->id === $model->id) {
            return true;
        }
        return Role::isSuperAdmin($user->level) && $user->level < $model->level;
    }

    public function delete(User $user, User $model): bool
    {
        if ($user->id === $model->id) {
            return false;
        }
        return Role::isSuperAdmin($user->level) && $user->level < $model->level;
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

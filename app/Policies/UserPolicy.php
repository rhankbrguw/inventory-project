<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class UserPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->level === 1;
    }

    public function view(User $user, User $model): bool
    {
        return $user->level === 1 || $user->id === $model->id;
    }

    public function create(User $user): bool
    {
        return $user->level === 1;
    }

    public function update(User $user, User $model): bool
    {
        if ($user->id === $model->id) {
            return true;
        }

        return $user->level === 1 && $user->level < $model->level;
    }

    public function delete(User $user, User $model): bool
    {
        if ($user->id === $model->id) {
            return false;
        }

        return $user->level === 1 && $user->level < $model->level;
    }

    public function restore(User $user, User $model): bool
    {
        return $user->level === 1 && $user->level < $model->level;
    }

    public function forceDelete(User $user, User $model): bool
    {
        return $user->level === 1 && $user->level < $model->level;
    }
}

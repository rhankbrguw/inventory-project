<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class CustomerPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->level <= 20;
    }

    public function view(User $user): bool
    {
        return $user->level <= 20;
    }

    public function create(User $user): bool
    {
        return $user->level <= 20;
    }

    public function update(User $user): bool
    {
        return $user->level <= 20;
    }

    public function delete(User $user): bool
    {
        return $user->level <= 10;
    }

    public function restore(User $user): bool
    {
        return $user->level <= 10;
    }
}

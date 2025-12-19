<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class SupplierPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->level <= 10;
    }

    public function view(User $user): bool
    {
        return $user->level <= 10;
    }

    public function create(User $user): bool
    {
        return $user->level <= 10 && $user->roles->first()?->code !== 'STF';
    }

    public function update(User $user): bool
    {
        return $user->level <= 10 && $user->roles->first()?->code !== 'STF';
    }

    public function delete(User $user): bool
    {
        return $user->level <= 10 && $user->roles->first()?->code !== 'STF';
    }

    public function restore(User $user): bool
    {
        return $user->level <= 10 && $user->roles->first()?->code !== 'STF';
    }
}

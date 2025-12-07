<?php

namespace App\Policies;

use App\Models\Supplier;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class SupplierPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->level <= 10;
    }

    public function view(User $user, Supplier $supplier): bool
    {
        return $user->level <= 10;
    }

    public function create(User $user): bool
    {
        return $user->level <= 10;
    }

    public function update(User $user, Supplier $supplier): bool
    {
        return $user->level <= 10;
    }

    public function delete(User $user, Supplier $supplier): bool
    {
        return $user->level <= 10;
    }

    public function restore(User $user, Supplier $supplier): bool
    {
        return $user->level <= 10;
    }
}

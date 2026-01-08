<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Supplier;
use App\Models\Role;
use Illuminate\Auth\Access\HandlesAuthorization;

class SupplierPolicy
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

    public function update(User $user, Supplier $supplier): bool
    {
        if ($user->level === Role::LEVEL_SUPER_ADMIN) {
            return true;
        }

        if (Role::isManagerial($user->level)) {
            if ($supplier->location_id === null) {
                return false;
            }
            return $user->locations->contains($supplier->location_id);
        }

        return false;
    }

    public function delete(User $user, Supplier $supplier): bool
    {
        if ($user->level === Role::LEVEL_SUPER_ADMIN) {
            return true;
        }

        if (Role::isManagerial($user->level)) {
            if ($supplier->location_id === null) {
                return false;
            }
            return $user->locations->contains($supplier->location_id);
        }

        return false;
    }

    public function restore(User $user, Supplier $supplier): bool
    {
        if ($user->level === Role::LEVEL_SUPER_ADMIN) {
            return true;
        }

        if (Role::isManagerial($user->level)) {
            if ($supplier->location_id === null) {
                return false;
            }
            return $user->locations->contains($supplier->location_id);
        }

        return false;
    }
}

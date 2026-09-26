<?php

namespace App\Policies;

use App\Models\Role;
use App\Models\Supplier;
use App\Models\User;
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
        if (! $supplier->location_id) {
            return false;
        }

        $role = $user->getRoleAtLocation($supplier->location_id);

        return $role && Role::isManagerial($role->level);
    }

    public function delete(User $user, Supplier $supplier): bool
    {
        return $this->update($user, $supplier);
    }

    public function restore(User $user, Supplier $supplier): bool
    {
        return $this->update($user, $supplier);
    }
}

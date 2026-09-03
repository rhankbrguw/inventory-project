<?php

namespace App\Policies;

use App\Models\Product;
use App\Models\Role;
use App\Models\User;
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

    public function update(User $user, Product $product): bool
    {
        if ($user->level === Role::LEVEL_SUPER_ADMIN) {
            return true;
        }
        if (! Role::isManagerial($user->level)) {
            return false;
        }
        if ($product->location_id === null) {
            return true;
        }

        $role = $user->getRoleAtLocation($product->location_id);

        return $role && Role::isManagerial($role->level);
    }

    public function delete(User $user, ?Product $product = null): bool
    {
        if ($user->level === Role::LEVEL_SUPER_ADMIN) {
            return true;
        }
        if (! Role::isManagerial($user->level)) {
            return false;
        }
        if (! $product || $product->location_id === null) {
            return true;
        }

        $role = $user->getRoleAtLocation($product->location_id);

        return $role && Role::isManagerial($role->level);
    }

    public function restore(User $user): bool
    {
        return Role::isManagerial($user->level);
    }
}

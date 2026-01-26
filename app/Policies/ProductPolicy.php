<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Role;
use App\Models\Product;
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
        if ($user->level === Role::LEVEL_SUPER_ADMIN) {
            return true;
        }

        return $user->roles->contains('code', Role::CODE_BRANCH_MGR);
    }

    public function update(User $user, Product $product): bool
    {
        if ($user->level === Role::LEVEL_SUPER_ADMIN) {
            return true;
        }

        if (!Role::isManagerial($user->level)) {
            return false;
        }

        if ($product->location_id === null) {
            return true;
        }

        $userLocationIds = $user->locations->pluck('id')->toArray();
        return in_array($product->location_id, $userLocationIds);
    }

    public function delete(User $user): bool
    {
        return $this->create($user);
    }

    public function restore(User $user): bool
    {
        return Role::isManagerial($user->level);
    }
}

<?php

namespace App\Policies;

use App\Models\Product;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class ProductPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->level <= 20;
    }

    public function view(User $user, Product $product): bool
    {
        return $user->level <= 20;
    }

    public function create(User $user): bool
    {
        return $user->level === 1 || $user->roles->first()?->code === 'BRM';
    }

    public function update(User $user, Product $product): bool
    {
        return $user->level === 1 || $user->roles->first()?->code === 'BRM';
    }

    public function delete(User $user, Product $product): bool
    {
        return $user->level === 1 || $user->roles->first()?->code === 'BRM';
    }

    public function restore(User $user, Product $product): bool
    {
        return $user->level === 1 || $user->roles->first()?->code === 'BRM';
    }
}

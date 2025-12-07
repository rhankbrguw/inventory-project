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
        return $user->level <= 10;
    }

    public function view(User $user, Product $product): bool
    {
        return $user->level <= 10;
    }

    public function create(User $user): bool
    {
        return $user->level <= 10;
    }

    public function update(User $user, Product $product): bool
    {
        return $user->level <= 10;
    }

    public function delete(User $user, Product $product): bool
    {
        // Prevent deleting if product has stock (logic usually in controller, but policy can block too)
        return $user->level <= 10;
    }

    public function restore(User $user, Product $product): bool
    {
        return $user->level <= 10;
    }
}

<?php

namespace App\Policies;

use App\Models\SellCartItem;
use App\Models\User;

class SellCartItemPolicy
{
    public function update(User $user, SellCartItem $cartItem): bool
    {
        return $user->id === $cartItem->user_id;
    }

    public function delete(User $user, SellCartItem $cartItem): bool
    {
        return $user->id === $cartItem->user_id;
    }
}

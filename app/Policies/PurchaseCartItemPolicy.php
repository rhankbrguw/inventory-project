<?php

namespace App\Policies;

use App\Models\PurchaseCartItem;
use App\Models\User;

class PurchaseCartItemPolicy
{
    public function update(User $user, PurchaseCartItem $cartItem): bool
    {
        return $user->id === $cartItem->user_id;
    }

    public function delete(User $user, PurchaseCartItem $cartItem): bool
    {
        return $user->id === $cartItem->user_id;
    }
}

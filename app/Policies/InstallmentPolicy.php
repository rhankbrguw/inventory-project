<?php

namespace App\Policies;

use App\Models\Installment;
use App\Models\Role;
use App\Models\Sell;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class InstallmentPolicy
{
    use HandlesAuthorization;

    public function pay(User $user, Installment $installment): bool
    {
        if ($user->level === Role::LEVEL_SUPER_ADMIN) {
            return true;
        }

        $parent = $installment->installmentable()->first();
        if (! $parent) {
            return false;
        }

        $buyerLocId = ($parent instanceof Sell && ! empty($parent->target_location_id))
            ? $parent->target_location_id
            : $parent->location_id;

        if (empty($buyerLocId)) {
            return false;
        }

        $accessibleIds = $user->getAccessibleLocationIds() ?? [];
        if (! in_array($buyerLocId, $accessibleIds)) {
            return false;
        }

        $role = $user->getRoleAtLocation($buyerLocId);

        return $role && in_array($role->code, [Role::CODE_WAREHOUSE_MGR, Role::CODE_BRANCH_MGR, Role::CODE_STAFF, Role::CODE_CASHIER]);
    }
}

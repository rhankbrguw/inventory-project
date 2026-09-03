<?php

namespace App\Policies;

use App\Models\Location;
use App\Models\Purchase;
use App\Models\Role;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class PurchasePolicy
{
    use HandlesAuthorization;

    private function hasRoleCode(User $user, int $locationId, array $allowedCodes): bool
    {
        $role = $user->getRoleAtLocation($locationId);

        return $role && in_array($role->code, $allowedCodes);
    }

    private function canAccessLocation(User $user, int $locationId): bool
    {
        $accessibleIds = $user->getAccessibleLocationIds();

        return $accessibleIds === null || in_array($locationId, $accessibleIds);
    }

    public function viewAny(User $user): bool
    {
        return Role::isOperational($user->level);
    }

    public function view(User $user, Purchase $purchase): bool
    {
        if ($user->level === Role::LEVEL_SUPER_ADMIN) {
            return true;
        }
        $accessibleIds = $user->getAccessibleLocationIds() ?? [];

        return in_array($purchase->location_id, $accessibleIds) || in_array($purchase->from_location_id, $accessibleIds);
    }

    public function createAtLocation(User $user, int $locationId): bool
    {
        $location = Location::with('type')->find($locationId);
        if (! $location || ! $location->type) {
            return false;
        }
        if ($user->level === Role::LEVEL_SUPER_ADMIN) {
            return $user->locations()->exists();
        }

        $allowed = $location->type->code === Location::CODE_WAREHOUSE
            ? [Role::CODE_WAREHOUSE_MGR, Role::CODE_STAFF]
            : [Role::CODE_BRANCH_MGR, Role::CODE_STAFF, Role::CODE_CASHIER];

        return $this->hasRoleCode($user, $locationId, $allowed);
    }

    public function approve(User $user, Purchase $purchase): bool
    {
        if (! $purchase->isInternal() || $purchase->user_id === $user->id) {
            return false;
        }
        if ($user->level === Role::LEVEL_SUPER_ADMIN) {
            return true;
        }
        if (! $this->canAccessLocation($user, $purchase->from_location_id)) {
            return false;
        }

        return $this->hasRoleCode($user, $purchase->from_location_id, [Role::CODE_WAREHOUSE_MGR, Role::CODE_BRANCH_MGR]);
    }

    public function reject(User $user, Purchase $purchase): bool
    {
        return $this->approve($user, $purchase);
    }

    public function ship(User $user, Purchase $purchase): bool
    {
        if (! $purchase->isInternal()) {
            return false;
        }
        if ($user->level === Role::LEVEL_SUPER_ADMIN) {
            return true;
        }
        if (! $this->canAccessLocation($user, $purchase->from_location_id)) {
            return false;
        }

        return $this->hasRoleCode($user, $purchase->from_location_id, [Role::CODE_WAREHOUSE_MGR, Role::CODE_BRANCH_MGR, Role::CODE_STAFF]);
    }

    public function receive(User $user, Purchase $purchase): bool
    {
        if (! $purchase->isInternal()) {
            return false;
        }
        if ($user->level === Role::LEVEL_SUPER_ADMIN) {
            return true;
        }
        if (! $this->canAccessLocation($user, $purchase->location_id)) {
            return false;
        }

        return $this->hasRoleCode($user, $purchase->location_id, [Role::CODE_WAREHOUSE_MGR, Role::CODE_BRANCH_MGR, Role::CODE_STAFF, Role::CODE_CASHIER]);
    }

    public function pay(User $user, Purchase $purchase): bool
    {
        if ($user->level === Role::LEVEL_SUPER_ADMIN) {
            return true;
        }
        if (! $this->canAccessLocation($user, $purchase->location_id)) {
            return false;
        }

        return $this->hasRoleCode($user, $purchase->location_id, [Role::CODE_WAREHOUSE_MGR, Role::CODE_BRANCH_MGR, Role::CODE_STAFF, Role::CODE_CASHIER]);
    }
}

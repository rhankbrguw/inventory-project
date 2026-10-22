<?php

namespace App\Policies;

use App\Models\Location;
use App\Models\Purchase;
use App\Models\Role;
use App\Models\Sell;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class SellPolicy
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

    public function view(User $user, Sell $sell): bool
    {
        if ($user->level === Role::LEVEL_SUPER_ADMIN) {
            return true;
        }
        $accessibleIds = $user->getAccessibleLocationIds() ?? [];

        return in_array($sell->location_id, $accessibleIds) || in_array($sell->getDestinationLocationId(), $accessibleIds);
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
            ? [Role::CODE_WAREHOUSE_MGR]
            : [Role::CODE_BRANCH_MGR, Role::CODE_STAFF, Role::CODE_CASHIER];

        return $this->hasRoleCode($user, $locationId, $allowed);
    }

    public function approve(User $user, Sell $sell): bool
    {
        $destId = $sell->getDestinationLocationId();
        if (! $destId || $sell->user_id === $user->id) {
            return false;
        }
        if ($user->level === Role::LEVEL_SUPER_ADMIN) {
            return true;
        }

        return $this->canAccessLocation($user, $destId) && $user->can('createAtLocation', [Purchase::class, $destId]);
    }

    public function reject(User $user, Sell $sell): bool
    {
        return $this->approve($user, $sell);
    }

    public function ship(User $user, Sell $sell): bool
    {
        if ($sell->status !== Sell::STATUS_APPROVED) {
            return false;
        }

        return $user->level === Role::LEVEL_SUPER_ADMIN || $this->createAtLocation($user, $sell->location_id);
    }

    public function receive(User $user, Sell $sell): bool
    {
        if ($sell->status !== Sell::STATUS_SHIPPING) {
            return false;
        }
        $destId = $sell->getDestinationLocationId();
        if (! $destId) {
            return false;
        }
        if ($user->level === Role::LEVEL_SUPER_ADMIN) {
            return true;
        }

        return $this->canAccessLocation($user, $destId) && $this->hasRoleCode($user, $destId, [Role::CODE_WAREHOUSE_MGR, Role::CODE_BRANCH_MGR, Role::CODE_STAFF]);
    }

    public function pay(User $user, Sell $sell): bool
    {
        if ($user->level === Role::LEVEL_SUPER_ADMIN) {
            return true;
        }
        $payerLocId = $sell->getDestinationLocationId() ?? $sell->location_id;

        return $this->canAccessLocation($user, $payerLocId) &&
            $this->hasRoleCode($user, $payerLocId, [Role::CODE_WAREHOUSE_MGR, Role::CODE_BRANCH_MGR, Role::CODE_STAFF, Role::CODE_CASHIER]);
    }
}

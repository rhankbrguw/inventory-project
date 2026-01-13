<?php

namespace App\Policies;

use App\Models\Sell;
use App\Models\User;
use App\Models\Role;
use App\Models\Location;
use App\Models\Purchase;
use Illuminate\Auth\Access\HandlesAuthorization;

class SellPolicy
{
    use HandlesAuthorization;

    private function hasRoleCode(User $user, int $locationId, array $allowedCodes): bool
    {
        $role = $user->getRoleAtLocation($locationId);
        return $role && in_array($role->code, $allowedCodes);
    }

    public function viewAny(): bool
    {
        return true;
    }

    public function view(User $user, Sell $sell): bool
    {
        if ($user->level === Role::LEVEL_SUPER_ADMIN) {
            return true;
        }

        $accessibleIds = $user->getAccessibleLocationIds() ?? [];

        return in_array($sell->location_id, $accessibleIds) ||
            in_array($sell->getDestinationLocationId(), $accessibleIds);
    }

    public function createAtLocation(User $user, int $locationId): bool
    {
        $location = Location::with('type')->find($locationId);

        if (!$location || !$location->type) {
            return false;
        }

        if ($user->level === Role::LEVEL_SUPER_ADMIN) {
            return $user->locations()->exists();
        }

        if ($location->type->code === 'WH') {
            return $this->hasRoleCode($user, $locationId, [Role::CODE_WAREHOUSE_MGR]);
        }

        if ($location->type->code === 'BR') {
            return $this->hasRoleCode($user, $locationId, [
                Role::CODE_BRANCH_MGR,
                Role::CODE_STAFF,
                Role::CODE_CASHIER
            ]);
        }

        return false;
    }

    public function approve(User $user, Sell $sell): bool
    {
        $destinationLocationId = $sell->getDestinationLocationId();

        if (!$destinationLocationId) {
            return false;
        }

        $accessibleIds = $user->getAccessibleLocationIds() ?? [];
        if (!in_array($destinationLocationId, $accessibleIds)) {
            return false;
        }

        if ($sell->user_id === $user->id) {
            return false;
        }

        return $user->can('createAtLocation', [Purchase::class, $destinationLocationId]);
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

        if ($user->level === Role::LEVEL_SUPER_ADMIN) {
            return $sell->user_id === $user->id;
        }

        return $this->createAtLocation($user, $sell->location_id);
    }

    public function receive(User $user, Sell $sell): bool
    {
        if ($sell->status !== Sell::STATUS_SHIPPING) {
            return false;
        }

        $destinationLocationId = $sell->getDestinationLocationId();

        if (!$destinationLocationId) {
            return false;
        }

        $accessibleIds = $user->getAccessibleLocationIds() ?? [];
        if (!in_array($destinationLocationId, $accessibleIds)) {
            return false;
        }

        return $this->hasRoleCode($user, $destinationLocationId, [
            Role::CODE_WAREHOUSE_MGR,
            Role::CODE_BRANCH_MGR,
            Role::CODE_STAFF
        ]);
    }
}

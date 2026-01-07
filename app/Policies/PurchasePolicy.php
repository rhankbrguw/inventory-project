<?php

namespace App\Policies;

use App\Models\Purchase;
use App\Models\User;
use App\Models\Role;
use App\Models\Location;
use Illuminate\Auth\Access\HandlesAuthorization;

class PurchasePolicy
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

    public function view(User $user, Purchase $purchase): bool
    {
        if ($user->level === Role::LEVEL_SUPER_ADMIN) {
            return true;
        }

        return in_array($purchase->location_id, $user->getAccessibleLocationIds() ?? []);
    }

    public function createAtLocation(User $user, int $locationId): bool
    {
        if ($user->level === Role::LEVEL_SUPER_ADMIN) {
            return true;
        }

        $location = Location::with('type')->find($locationId);
        if (!$location || !$location->type) {
            return false;
        }

        if ($location->type->code === 'WH') {
            return $this->hasRoleCode($user, $locationId, [
                Role::CODE_WAREHOUSE_MGR,
                Role::CODE_STAFF
            ]);
        }

        if ($location->type->code === 'BR') {
            return $this->hasRoleCode($user, $locationId, [
                Role::CODE_BRANCH_MGR
            ]);
        }

        return false;
    }

    public function update(User $user, Purchase $purchase): bool
    {
        if ($purchase->status !== 'Pending') {
            return false;
        }

        return $this->createAtLocation($user, $purchase->location_id);
    }

    public function delete(User $user, Purchase $purchase): bool
    {
        if ($purchase->status !== 'Pending') {
            return false;
        }
        return $this->createAtLocation($user, $purchase->location_id);
    }
}

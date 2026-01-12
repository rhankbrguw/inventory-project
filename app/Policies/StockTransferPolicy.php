<?php

namespace App\Policies;

use App\Models\StockTransfer;
use App\Models\User;
use App\Models\Role;
use App\Models\Location;
use Illuminate\Auth\Access\HandlesAuthorization;

class StockTransferPolicy
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

    public function view(User $user, StockTransfer $transfer): bool
    {
        if ($user->level === Role::LEVEL_SUPER_ADMIN) {
            return true;
        }

        $accessibleIds = $user->getAccessibleLocationIds() ?? [];

        return in_array($transfer->from_location_id, $accessibleIds)
            || in_array($transfer->to_location_id, $accessibleIds);
    }

    public function createAtLocation(User $user, int $fromLocationId): bool
    {
        $location = Location::with('type')->find($fromLocationId);

        if (!$location || !$location->type) {
            return false;
        }

        if ($user->level === Role::LEVEL_SUPER_ADMIN) {
            return $user->locations()->exists();
        }

        if ($location->type->code === 'WH') {
            return $this->hasRoleCode($user, $fromLocationId, [
                Role::CODE_WAREHOUSE_MGR,
                Role::CODE_STAFF
            ]);
        }

        if ($location->type->code === 'BR') {
            return false;
        }

        return false;
    }

    public function accept(User $user, StockTransfer $transfer): bool
    {

        $accessibleIds = $user->getAccessibleLocationIds() ?? [];
        if (!in_array($transfer->to_location_id, $accessibleIds)) {
            return false;
        }

        if ($transfer->user_id === $user->id) {
            return false;
        }

        return $this->hasRoleCode($user, $transfer->to_location_id, [
            Role::CODE_WAREHOUSE_MGR,
            Role::CODE_BRANCH_MGR
        ]);
    }

    public function reject(User $user, StockTransfer $transfer): bool
    {
        return $this->accept($user, $transfer);
    }

    public function ship(User $user, StockTransfer $transfer): bool
    {
        $accessibleIds = $user->getAccessibleLocationIds() ?? [];
        if (!in_array($transfer->from_location_id, $accessibleIds)) {
            return false;
        }

        if ($user->level === Role::LEVEL_SUPER_ADMIN) {
            return $transfer->user_id === $user->id;
        }

        return $this->hasRoleCode($user, $transfer->from_location_id, [
            Role::CODE_WAREHOUSE_MGR,
            Role::CODE_STAFF
        ]);
    }

    public function receive(User $user, StockTransfer $transfer): bool
    {
        $accessibleIds = $user->getAccessibleLocationIds() ?? [];
        if (!in_array($transfer->to_location_id, $accessibleIds)) {
            return false;
        }

        return $this->hasRoleCode($user, $transfer->to_location_id, [
            Role::CODE_WAREHOUSE_MGR,
            Role::CODE_BRANCH_MGR
        ]);
    }
}

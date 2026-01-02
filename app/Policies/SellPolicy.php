<?php

namespace App\Policies;

use App\Models\Sell;
use App\Models\User;
use App\Models\Role;
use Illuminate\Auth\Access\HandlesAuthorization;

class SellPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return Role::isOperational($user->level);
    }

    public function view(User $user, Sell $sell): bool
    {
        if (Role::isSuperAdmin($user->level)) {
            return true;
        }

        $accessibleLocationIds = $user->getAccessibleLocationIds() ?? [];

        if (in_array($sell->location_id, $accessibleLocationIds)) {
            return true;
        }

        if (!$sell->relationLoaded('customer')) {
            $sell->load('customer');
        }

        $targetLocationId = $sell->customer?->related_location_id;

        if ($targetLocationId && in_array($targetLocationId, $accessibleLocationIds)) {
            return true;
        }

        return false;
    }

    public function create(User $user): bool
    {
        return Role::isOperational($user->level);
    }

    public function createAtLocation(User $user, int $locationId): bool
    {
        return $user->canTransactAtLocation($locationId, 'sell');
    }

    public function update(User $user, Sell $sell): bool
    {
        if (strtolower($sell->status) !== 'pending') {
            return false;
        }

        return $user->canTransactAtLocation($sell->location_id, 'sell');
    }

    public function delete(User $user, Sell $sell): bool
    {
        if (strtolower($sell->status) !== 'pending') {
            return false;
        }

        return $user->canTransactAtLocation($sell->location_id, 'sell');
    }
}

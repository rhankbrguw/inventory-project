<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class StockPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->level <= 20;
    }

    public function view(User $user, $stock): bool
    {
        if ($user->level === 1) {
            return true;
        }
        $accessibleLocationIds = $user->getAccessibleLocationIds();
        if (!$accessibleLocationIds) {
            return true;
        }
        return in_array($stock->location_id, $accessibleLocationIds);
    }

    public function adjust(User $user, $locationId): bool
    {
        if ($user->level === 1) {
            return true;
        }

        $role = $user->getRoleAtLocation($locationId);
        return $role && $role->level <= 10;
    }
}

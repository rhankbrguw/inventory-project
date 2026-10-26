<?php

namespace App\Policies;

use App\Models\Role;
use App\Models\StockMovement;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class StockMovementPolicy
{
    use HandlesAuthorization;

    /**
     * Only managerial roles may browse the stock movement log.
     * Cashiers and unassigned users are excluded — they do not have
     * operational need to see cost prices or supply chain history.
     */
    public function viewAny(User $user): bool
    {
        return Role::isManagerial($user->level);
    }

    /**
     * A user may view a single movement only if it belongs to a location
     * they have access to.
     */
    public function view(User $user, StockMovement $movement): bool
    {
        if (Role::isSuperAdmin($user->level)) {
            return true;
        }

        $accessibleIds = $user->getAccessibleLocationIds() ?? [];

        return in_array($movement->location_id, $accessibleIds);
    }
}

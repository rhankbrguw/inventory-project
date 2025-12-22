<?php

namespace App\Policies;

use App\Models\StockTransfer;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class StockTransferPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->level <= 10;
    }

    public function view(User $user, StockTransfer $transfer): bool
    {
        if ($user->level === 1) {
            return true;
        }

        $accessibleIds = $user->getAccessibleLocationIds() ?? [];
        return in_array($transfer->from_location_id, $accessibleIds) ||
            in_array($transfer->to_location_id, $accessibleIds);
    }

    public function create(User $user): bool
    {
        return $user->level <= 10;
    }

    public function createAtLocation(User $user, $fromLocationId): bool
    {
        return $user->canTransactAtLocation($fromLocationId, 'transfer');
    }
}

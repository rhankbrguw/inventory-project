<?php

namespace App\Services;

use App\Models\Role;
use App\Models\StockTransfer;
use App\Models\User;
use App\Notifications\StockTransferNotification;
use App\Notifications\TransferAcceptedNotification;
use App\Notifications\TransferShippedNotification;

class StockTransferNotificationService
{
    public function notifyManagers(StockTransfer $transfer, User $actor, array|int $locationIds, string $event, ?int $includeUserId = null): void
    {
        $roleIds = Role::whereIn('code', [Role::CODE_BRANCH_MGR, Role::CODE_WAREHOUSE_MGR])->pluck('id');
        if ($roleIds->isEmpty()) {
            return;
        }

        $locIds = is_array($locationIds) ? $locationIds : [$locationIds];
        $recipients = $this->getRecipients($locIds, $roleIds, $actor->id, $includeUserId);

        $recipients->each(fn (User $recipient) => $this->dispatchNotification($recipient, $transfer, $actor->name, $event));
    }

    private function getRecipients(array $locIds, \Illuminate\Support\Collection $roleIds, int $actorId, ?int $includeUserId): \Illuminate\Database\Eloquent\Collection
    {
        return User::where(function ($query) use ($locIds, $roleIds, $includeUserId) {
            $query->whereHas('locations', fn ($q) => $q
                ->whereIn('locations.id', $locIds)
                ->whereIn('location_user.role_id', $roleIds)
            );
            if ($includeUserId) {
                $query->orWhere('id', $includeUserId);
            }
        })
            ->where('id', '!=', $actorId)
            ->get()
            ->unique('id');
    }

    private function dispatchNotification(User $recipient, StockTransfer $transfer, string $actorName, string $event): void
    {
        rescue(function () use ($recipient, $transfer, $actorName, $event) {
            $notification = match ($event) {
                'new_request' => new StockTransferNotification($transfer, $actorName),
                'shipped' => new TransferShippedNotification($transfer, $actorName),
                'approved' => new TransferAcceptedNotification($transfer, $actorName),
                default => null,
            };

            if ($notification) {
                $recipient->notify($notification);
            }
        });
    }
}

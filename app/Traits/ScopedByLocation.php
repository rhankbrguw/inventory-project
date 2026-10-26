<?php

namespace App\Traits;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;

trait ScopedByLocation
{
    public function location(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(\App\Models\Location::class);
    }

    public function scopeAccessibleBy(Builder $query, mixed $userOrIds): Builder
    {
        if ($userOrIds instanceof User) {
            if ($userOrIds->level === Role::LEVEL_SUPER_ADMIN) {
                return $query;
            }
            $locationIds = $userOrIds->getAccessibleLocationIds();
        } else {
            $locationIds = $userOrIds;
        }

        if ($locationIds === null) {
            return $query;
        }

        return $query->where(function ($q) use ($locationIds) {
            $q->whereNull('location_id')
                ->orWhereIn('location_id', $locationIds);
        });
    }
}

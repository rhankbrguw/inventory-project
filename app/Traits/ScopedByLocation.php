<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;
use App\Models\Role;
use App\Models\User;

trait ScopedByLocation
{
    public function location()
    {
        return $this->belongsTo(\App\Models\Location::class);
    }

    public function scopeAccessibleBy(Builder $query, $userOrIds)
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

<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;

trait ScopedByLocation
{
    public function scopeAccessibleBy(Builder $query, ?array $locationIds): Builder
    {
        if ($locationIds === null) {
            return $query;
        }

        return $query->whereIn('location_id', $locationIds);
    }
}

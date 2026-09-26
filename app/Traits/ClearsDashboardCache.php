<?php

namespace App\Traits;

use Illuminate\Support\Facades\Redis;

trait ClearsDashboardCache
{
    public static function bootClearsDashboardCache(): void
    {
        static::saved(fn () => static::invalidateDashboardCache());
        static::deleted(fn () => static::invalidateDashboardCache());
    }

    public static function invalidateDashboardCache(): void
    {
        try {
            $keys = Redis::keys('*dash_*');
            if (! empty($keys)) {
                Redis::del($keys);
            }
        } catch (\Throwable) {
            // fallback gracefully
        }
    }
}

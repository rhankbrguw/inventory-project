<?php

namespace App\Providers;

use App\Models\Location;
use App\Models\Type;
use App\Observers\LocationObserver;
use App\Observers\TypeObserver;
use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Listeners\SendEmailVerificationNotification;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        Registered::class => [
            SendEmailVerificationNotification::class,
        ],
    ];

    public function boot(): void
    {
        Type::observe(TypeObserver::class);

        Location::observe(LocationObserver::class);
    }

    public function shouldDiscoverEvents(): bool
    {
        return false;
    }
}

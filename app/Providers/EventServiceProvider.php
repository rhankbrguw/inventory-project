<?php

namespace App\Providers;

use App\Models\Location;
use App\Models\Type;
use App\Observers\LocationObserver;
use App\Observers\TypeObserver;
use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Listeners\SendEmailVerificationNotification;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

/**
 * Registers event listeners and model observers for the application.
 */
class EventServiceProvider extends ServiceProvider
{
    /**
     * @var array<class-string, array<int, class-string>>
     */
    protected $listen = [
        Registered::class => [
            SendEmailVerificationNotification::class,
        ],
    ];

    /**
     * Register model observers and event listeners.
     */
    public function boot(): void
    {
        Type::observe(TypeObserver::class);
        Location::observe(LocationObserver::class);
    }

    /**
     * Determine if events and listeners should be automatically discovered.
     */
    public function shouldDiscoverEvents(): bool
    {
        return false;
    }
}

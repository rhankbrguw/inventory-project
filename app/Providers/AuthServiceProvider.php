<?php

namespace App\Providers;

use App\Models\Location;
use App\Models\Purchase;
use App\Models\PurchaseCartItem;
use App\Models\Sell;
use App\Models\SellCartItem;
use App\Models\User;
use App\Policies\LocationPolicy;
use App\Policies\PurchasePolicy;
use App\Policies\PurchaseCartItemPolicy;
use App\Policies\SellPolicy;
use App\Policies\SellCartItemPolicy;
use App\Policies\UserPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        PurchaseCartItem::class => PurchaseCartItemPolicy::class,
        SellCartItem::class => SellCartItemPolicy::class,
        User::class => UserPolicy::class,
        Location::class => LocationPolicy::class,
        Purchase::class => PurchasePolicy::class,
        Sell::class => SellPolicy::class,
    ];

    public function boot(): void
    {
        $this->registerPolicies();
    }
}

<?php

namespace App\Providers;

use App\Models\PurchaseCartItem;
use App\Models\SellCartItem;
use App\Policies\PurchaseCartItemPolicy;
use App\Policies\SellCartItemPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        PurchaseCartItem::class => PurchaseCartItemPolicy::class,
        SellCartItem::class => SellCartItemPolicy::class,
    ];

    public function boot(): void
    {
        //
    }
}

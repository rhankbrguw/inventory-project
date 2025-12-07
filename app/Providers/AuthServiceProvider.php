<?php

namespace App\Providers;

use App\Models\Customer;
use App\Models\Location;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\PurchaseCartItem;
use App\Models\Sell;
use App\Models\SellCartItem;
use App\Models\Supplier;
use App\Models\User;
use App\Policies\CustomerPolicy;
use App\Policies\LocationPolicy;
use App\Policies\ProductPolicy;
use App\Policies\PurchasePolicy;
use App\Policies\PurchaseCartItemPolicy;
use App\Policies\SellPolicy;
use App\Policies\SellCartItemPolicy;
use App\Policies\SupplierPolicy;
use App\Policies\UserPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        PurchaseCartItem::class => PurchaseCartItemPolicy::class,
        SellCartItem::class => SellCartItemPolicy::class,
        User::class => UserPolicy::class,
        Location::class => LocationPolicy::class,
        Purchase::class => PurchasePolicy::class,
        Sell::class => SellPolicy::class,
        Product::class => ProductPolicy::class,
        Supplier::class => SupplierPolicy::class,
        Customer::class => CustomerPolicy::class,
    ];

    public function boot(): void
    {
        $this->registerPolicies();

        Gate::before(function ($user, $ability) {
            if ($user->level === 1) {
                return true;
            }
        });
    }
}

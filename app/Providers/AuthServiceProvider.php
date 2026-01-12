<?php

namespace App\Providers;

use App\Models\Customer;
use App\Models\Location;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\PurchaseCartItem;
use App\Models\Sell;
use App\Models\SellCartItem;
use App\Models\StockTransfer;
use App\Models\Supplier;
use App\Models\User;
use App\Models\Inventory;
use App\Policies\CustomerPolicy;
use App\Policies\LocationPolicy;
use App\Policies\ProductPolicy;
use App\Policies\PurchaseCartItemPolicy;
use App\Policies\PurchasePolicy;
use App\Policies\SellCartItemPolicy;
use App\Policies\SellPolicy;
use App\Policies\StockTransferPolicy;
use App\Policies\SupplierPolicy;
use App\Policies\UserPolicy;
use App\Policies\StockPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        Customer::class => CustomerPolicy::class,
        Location::class => LocationPolicy::class,
        Product::class => ProductPolicy::class,
        Purchase::class => PurchasePolicy::class,
        PurchaseCartItem::class => PurchaseCartItemPolicy::class,
        Sell::class => SellPolicy::class,
        SellCartItem::class => SellCartItemPolicy::class,
        StockTransfer::class => StockTransferPolicy::class,
        Supplier::class => SupplierPolicy::class,
        User::class => UserPolicy::class,
        Inventory::class => StockPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        $this->registerPolicies();

        /**
         * Super Admin Gate Bypass (with exceptions for workflow enforcement)
         */
        Gate::before(function ($user, $ability, $models) {
            if ($user->level !== 1) {
                return null;
            }

            $modelClass = null;
            if (is_array($models) && count($models) > 0) {
                $first = $models[0];
                $modelClass = is_object($first) ? get_class($first) : $first;
            }

            /**
             * This ensures audit trail and prevents fraud even for super admin
             */
            if ($modelClass === StockTransfer::class) {
                $restrictedAbilities = ['accept', 'reject', 'receive'];

                if (in_array($ability, $restrictedAbilities)) {
                    return null;
                }

                return true;
            }

            return true;
        });
    }
}

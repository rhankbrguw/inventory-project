<?php

namespace App\Providers;

use App\Models\Customer;
use App\Models\Installment;
use App\Models\Inventory;
use App\Models\Location;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\PurchaseCartItem;
use App\Models\Role;
use App\Models\SellCartItem;
use App\Models\StockMovement;
use App\Models\StockTransfer;
use App\Models\Supplier;
use App\Models\User;
use App\Policies\CustomerPolicy;
use App\Policies\InstallmentPolicy;
use App\Policies\LocationPolicy;
use App\Policies\ProductPolicy;
use App\Policies\PurchaseCartItemPolicy;
use App\Policies\PurchasePolicy;
use App\Policies\SellCartItemPolicy;
use App\Policies\SellPolicy;
use App\Policies\StockMovementPolicy;
use App\Policies\StockPolicy;
use App\Policies\StockTransferPolicy;
use App\Policies\SupplierPolicy;
use App\Policies\UserPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        Customer::class => CustomerPolicy::class, Installment::class => InstallmentPolicy::class,
        Inventory::class => StockPolicy::class, Location::class => LocationPolicy::class,
        Product::class => ProductPolicy::class, Purchase::class => PurchasePolicy::class,
        PurchaseCartItem::class => PurchaseCartItemPolicy::class, \App\Models\Sell::class => SellPolicy::class,
        SellCartItem::class => SellCartItemPolicy::class, StockMovement::class => StockMovementPolicy::class,
        StockTransfer::class => StockTransferPolicy::class, Supplier::class => SupplierPolicy::class,
        User::class => UserPolicy::class,
    ];

    public function boot(): void
    {
        $this->registerPolicies();
        $this->registerGates();
    }

    private function registerGates(): void
    {
        Gate::define('view-reports', fn (User $user): bool => Role::isManagerial($user->level));
        Gate::before(fn ($user, $ability) => $user->level === Role::LEVEL_SUPER_ADMIN ? true : null);
    }
}

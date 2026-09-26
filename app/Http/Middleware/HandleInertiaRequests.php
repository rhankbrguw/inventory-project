<?php

namespace App\Http\Middleware;

use App\Models\Customer;
use App\Models\Inventory;
use App\Models\Location;
use App\Models\Product;
use App\Models\Role;
use App\Models\StockMovement;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Cache;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function share(Request $request): array
    {
        $user = $request->user();
        if ($user) {
            $user->loadMissing(['roles', 'locations.type']);
        }

        $locale = $user && $user->locale ? $user->locale : ($request->hasSession() ? session('locale', config('app.locale')) : config('app.locale'));
        App::setLocale($locale);

        return [
            ...parent::share($request),
            'csrf_token' => fn () => $request->hasSession() ? $request->session()->token() : null,
            'locale' => $locale,
            'translations' => fn () => $this->getTranslations($locale),
            'auth' => $this->getAuthPayload($user),
            'flash' => [
                'success' => fn () => $request->hasSession() ? $request->session()->get('success') : null,
                'error' => fn () => $request->hasSession() ? $request->session()->get('error') : null,
            ],
        ];
    }

    private function getTranslations(string $locale): array
    {
        $loader = function () use ($locale) {
            $files = glob(base_path("lang/{$locale}/*.php"));
            $strings = [];
            foreach ($files as $file) {
                $strings[basename($file, '.php')] = require $file;
            }

            return $strings;
        };

        return App::isLocal() ? $loader() : Cache::remember("translations_{$locale}", now()->addHour(), $loader);
    }

    private function getAuthPayload(?User $user): array
    {
        $userLevel = $user ? (int) $user->level : 999;

        return [
            'user' => $user ? $this->formatUser($user, $userLevel) : null,
            'role_definitions' => [
                'SUPER_ADMIN' => Role::LEVEL_SUPER_ADMIN,
                'THRESHOLD_MANAGERIAL' => Role::THRESHOLD_MANAGERIAL,
                'THRESHOLD_STAFF' => Role::THRESHOLD_STAFF,
            ],
            'can' => $user ? $this->getPermissions($user, $userLevel) : [],
        ];
    }

    private function formatUser(User $user, int $level): array
    {
        $user->loadMissing(['roles', 'locations.type']);

        return [
            'id' => $user->id, 'name' => $user->name, 'email' => $user->email, 'phone' => $user->phone, 'level' => $level,
            'role' => $user->roles->first() ? ['name' => $user->roles->first()->name, 'code' => $user->roles->first()->code] : null,
            'has_locations' => $user->level === Role::LEVEL_SUPER_ADMIN || $user->locations->isNotEmpty(),
            'locations' => $user->locations->map(fn ($l) => [
                'id' => $l->id, 'name' => $l->name,
                'type' => $l->type ? ['code' => $l->type->code, 'name' => $l->type->name, 'level' => $l->type->level] : null,
            ]),
        ];
    }

    private function getPermissions(User $user, int $level): array
    {
        return Cache::remember("user_perms_{$user->id}_{$level}", 300, function () use ($user, $level) {
            $isSuper = $level === Role::LEVEL_SUPER_ADMIN;
            $isOperational = Role::isOperational($level);
            $hasLoc = $isSuper || $user->locations->isNotEmpty();

            return [
                'view_dashboard' => true, 'view_products' => $user->can('viewAny', Product::class),
                'view_locations' => $user->can('viewAny', Location::class), 'view_inventory' => $user->can('viewAny', Inventory::class),
                'view_stock_movements' => $user->can('viewAny', StockMovement::class), 'view_transactions' => $isOperational,
                'view_suppliers' => $user->can('viewAny', Supplier::class), 'view_customers' => $user->can('viewAny', Customer::class),
                'view_reports' => $user->can('view-reports'), 'manage_system' => $isSuper,
                'create_product' => $user->can('create', Product::class), 'create_customer' => $user->can('create', Customer::class),
                'create_supplier' => $user->can('create', Supplier::class), 'manage_types' => $isSuper,
                'create_purchase' => $hasLoc && $isOperational,
                'create_sell' => $hasLoc && $isOperational,
                'create_transfer' => $hasLoc && $isOperational,
            ];
        });
    }
}

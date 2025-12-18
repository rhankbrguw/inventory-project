<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     *
     * @param  \Illuminate\Http\Request  $request
     * @return string|null
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        /*
         * Eager load user relations if authenticated
         * to avoid N+1 query problems.
         */
        if ($user) {
            $user->loadMissing(['roles', 'locations.type']);
        }

        return [
            ...parent::share($request),

            /*
             * Authentication data shared with frontend.
             */
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'level' => $user->level,
                    'role' => $user->roles->first() ? [
                        'name' => $user->roles->first()->name,
                        'code' => $user->roles->first()->code,
                    ] : null,
                    'has_locations' => $user->level === 1 || $user->locations()->exists(),
                    'locations' => $user->locations->map(function ($location) {
                        return [
                            'id' => $location->id,
                            'name' => $location->name,
                            'type' => $location->type ? [
                                'code' => $location->type->code,
                                'name' => $location->type->name,
                                'level' => $location->type->level,
                            ] : null,
                        ];
                    }),
                ] : null,
            ],

            /*
             * Flash messages for notifications.
             */
            'flash' => [
                'success' => fn() => $request->session()->get('success'),
                'error' => fn() => $request->session()->get('error'),
            ],
        ];
    }
}

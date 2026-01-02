<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use Illuminate\Support\Facades\App;
use App\Models\Role;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version for Inertia.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return string|null
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that should be shared with all Inertia responses.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        if ($user) {
            $user->loadMissing(['roles', 'locations.type']);
        }

        $user = $request->user();
        $locale = $user && $user->locale ? $user->locale : session('locale', config('app.locale'));
        App::setLocale($locale);

        return [
            ...parent::share($request),

            'csrf_token' => fn() => $request->session()->token(),
            'locale' => $locale,

            'translations' => function () use ($locale) {
                $files = glob(base_path("lang/{$locale}/*.php"));
                $strings = [];
                foreach ($files as $file) {
                    $name = basename($file, '.php');
                    $strings[$name] = require $file;
                }
                return $strings;
            },

            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,

                    'level' => (int) $user->level,

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

                'role_definitions' => [
                    'SUPER_ADMIN'          => Role::LEVEL_SUPER_ADMIN,
                    'THRESHOLD_MANAGERIAL' => Role::THRESHOLD_MANAGERIAL,
                    'THRESHOLD_STAFF'      => Role::THRESHOLD_STAFF,
                ],
            ],

            'flash' => [
                'success' => fn() => $request->session()->get('success'),
                'error' => fn() => $request->session()->get('error'),
            ],
        ];
    }
}

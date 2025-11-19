<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the initial Inertia page load.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     *
     * This helps Inertia automatically detect when frontend assets
     * have been changed, so it can force a full page reload.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return string|null
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared with every Inertia response.
     *
     * This method runs on every request and allows global data
     * such as the authenticated user and flash messages to be
     * sent to the frontend.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        if ($user) {
            // Ensure roles are eager-loaded for permission usage on frontend
            $user->loadMissing('roles');
        }

        return [
            ...parent::share($request),

            'auth' => [
                'user' => $user ? [
                    'id'    => $user->id,
                    'name'  => $user->name,
                    'email' => $user->email,

                    // Hierarchy level exposed globally
                    'level' => $user->level,

                    // First/primary role object (for badges, UI)
                    'role' => $user->roles->first(),

                    // Array of role names (sidebar guards, menus)
                    'roles' => $user->getRoleNames(),
                ] : null,
            ],

            'flash' => [
                'success' => fn() => $request->session()->get('success'),
                'error'   => fn() => $request->session()->get('error'),
            ],
        ];
    }
}

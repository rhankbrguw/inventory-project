<?php

namespace App\Http\Middleware;

use App\Models\Role;
use App\Models\SystemSetting;
use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureSystemIsSetup
{
    public function handle(Request $request, Closure $next): Response
    {
        $hasSuperAdmin = User::whereHas('roles', fn ($q) => $q->where('level', Role::LEVEL_SUPER_ADMIN))->exists();

        if ($request->is('setup') || $request->is('setup/*')) {
            if (SystemSetting::isSetupCompleted() || $hasSuperAdmin) {
                return redirect()->route('login');
            }

            return $next($request);
        }

        if (! SystemSetting::isSetupCompleted()) {
            if ($hasSuperAdmin) {
                SystemSetting::markSetupCompleted();

                return $next($request);
            }

            return redirect()->route('setup.index');
        }

        return $next($request);
    }
}

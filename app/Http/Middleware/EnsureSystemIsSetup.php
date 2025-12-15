<?php

namespace App\Http\Middleware;

use App\Models\SystemSetting;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureSystemIsSetup
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->is('setup') || $request->is('setup/*')) {
            return $next($request);
        }

        if (!SystemSetting::isSetupCompleted()) {
            return redirect()->route('setup.index');
        }

        return $next($request);
    }
}

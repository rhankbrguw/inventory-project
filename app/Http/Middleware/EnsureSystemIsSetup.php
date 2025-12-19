<?php

namespace App\Http\Middleware;

use App\Models\SystemSetting;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureSystemIsSetup
{
    /**
     * Handle an incoming request.
     *
     * This middleware ensures that the system setup
     * has been completed before accessing protected routes.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function handle(Request $request, Closure $next): Response
    {
        /*
         * Allow access to setup routes regardless of setup status.
         */
        if ($request->is('setup') || $request->is('setup/*')) {
            return $next($request);
        }

        /*
         * Redirect to setup page if the system setup
         * has not been completed yet.
         */
        if (! SystemSetting::isSetupCompleted()) {
            return redirect()->route('setup.index');
        }

        /*
         * Proceed with the request if setup is completed.
         */
        return $next($request);
    }
}

<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;

class VerifyCsrfToken extends Middleware
{
    /**
     * The URIs that should be excluded from CSRF verification.
     *
     * @var array<int, string>
     */
    protected $except = [
        'broadcasting/auth',
        'login',
        'register',
        'api/payment/webhook/*',
        'payment/webhook/*',
    ];

    public function handle($request, \Closure $next)
    {
        if (app()->environment('testing')) {
            return $next($request);
        }

        return parent::handle($request, $next);
    }
}

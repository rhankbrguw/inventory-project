<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class LogBroadcastingAuth
{
    /**
     * Handle an incoming request.
     *
     * Logs detailed information for broadcasting authentication
     * requests to help debug session, authentication, and CSRF issues.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        if ($request->path() === 'broadcasting/auth') {

            Log::info('AUTH REQUEST', [
                'method' => $request->method(),
                'path' => $request->path(),

                'has_session' => $request->hasSession(),
                'session_started' => $request->session()->isStarted(),
                'session_id' => $request->session()->getId(),

                'auth_check' => auth()->check(),
                'auth_user_id' => auth()->id(),
                'auth_user_name' => auth()->user()?->name,

                'cookies' => array_keys($request->cookies->all()),
                'csrf_token_match' =>
                $request->session()->token() === $request->input('_token') ||
                    $request->session()->token() === $request->header('X-CSRF-TOKEN'),

                'socket_id' => $request->input('socket_id'),
                'channel_name' => $request->input('channel_name'),
            ]);
        }

        return $next($request);
    }
}

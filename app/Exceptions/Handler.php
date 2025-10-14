<?php

namespace App\Exceptions;

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Support\Facades\Redirect;
use Throwable;

class Handler extends ExceptionHandler
{
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    public function register(): void
    {
        $this->renderable(function (AuthorizationException $e, $request) {
            return Redirect::back()->with('error', 'Anda tidak memiliki wewenang untuk melakukan tindakan ini.');
        });

        $this->reportable(function (Throwable $e) {
            //
        });
    }
}

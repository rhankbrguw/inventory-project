<?php

namespace App\Exceptions;

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
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
        $this->renderable(function (Throwable $e) {
            $request = request();

            if ($e instanceof ValidationException) {
                return null;
            }

            if ($request->is('api/*') || $request->wantsJson() || $request->inertia()) {

                if ($e instanceof AuthorizationException) {
                    return Redirect::back()->with('error', 'Anda tidak memiliki wewenang untuk tindakan ini.');
                }

                $statusCode = 500;
                if ($e instanceof NotFoundHttpException || $e instanceof ModelNotFoundException) {
                    $statusCode = 404;
                } elseif (method_exists($e, 'getStatusCode')) {
                    $statusCode = $e->getStatusCode();
                }

                $message = $e->getMessage();
                if ($statusCode === 404 && empty($message)) {
                    $message = 'Data tidak ditemukan.';
                }

                $response = [
                    'message' => $message,
                    'exception' => get_class($e),
                    'status_code' => $statusCode,
                ];

                if (config('app.debug')) {
                    $response['file'] = $e->getFile();
                    $response['line'] = $e->getLine();
                }

                return response()->json($response, $statusCode);
            }
        });
    }
}

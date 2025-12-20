<?php

namespace App\Exceptions;

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpException;
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
        $this->reportable(function (Throwable $e) {
            if ($this->shouldReport($e)) {
                Log::error('Exception occurred', [
                    'exception' => get_class($e),
                    'message' => $e->getMessage(),
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                    'url' => request()->fullUrl(),
                    'user_id' => auth()->id(),
                ]);
            }
        });

        $this->renderable(function (Throwable $e, $request) {
            if ($e instanceof ValidationException) {
                return null;
            }

            if ($request->is('api/*') && $request->wantsJson()) {
                return $this->handleJsonResponse($e);
            }

            return null;
        });
    }

    protected function handleJsonResponse(Throwable $e): JsonResponse
    {
        $statusCode = $this->getStatusCode($e);
        $message = $this->getErrorMessage($e, $statusCode);

        $response = [
            'message' => $message,
            'status_code' => $statusCode,
        ];

        if (config('app.debug')) {
            $response['debug'] = [
                'exception' => get_class($e),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ];
        }

        return response()->json($response, $statusCode);
    }

    protected function getStatusCode(Throwable $e): int
    {
        if ($e instanceof NotFoundHttpException || $e instanceof ModelNotFoundException) {
            return 404;
        }

        if ($e instanceof AuthorizationException) {
            return 403;
        }

        if ($e instanceof AuthenticationException) {
            return 401;
        }

        if ($e instanceof HttpException) {
            return $e->getStatusCode();
        }

        if (method_exists($e, 'getStatusCode')) {
            return $e->getStatusCode();
        }

        return 500;
    }

    protected function getErrorMessage(Throwable $e, int $statusCode): string
    {
        $message = $e->getMessage();

        if (empty($message) || $statusCode >= 500) {
            return match ($statusCode) {
                401 => 'Authentication required.',
                403 => 'You do not have permission to access this resource.',
                404 => 'The requested resource was not found.',
                419 => 'Your session has expired. Please refresh the page.',
                429 => 'Too many requests. Please slow down.',
                500 => 'An internal server error occurred. Please try again later.',
                502 => 'Bad gateway. Please try again.',
                503 => 'Service temporarily unavailable.',
                default => 'An unexpected error occurred.',
            };
        }

        return $message;
    }
}

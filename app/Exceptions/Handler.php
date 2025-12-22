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

/**
 * Exception Handler
 *
 * Handles exception reporting and rendering for the application.
 * Provides custom error responses for different exception types,
 * with enhanced logging and JSON response formatting for API requests.
 *
 * @package App\Exceptions
 */
class Handler extends ExceptionHandler
{
    /**
     * A list of exception types with their corresponding custom log levels.
     *
     * @var array<class-string<\Throwable>, \Psr\Log\LogLevel::*>
     */
    protected $levels = [];

    /**
     * A list of the inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     *
     * Configures custom reporting and rendering logic for exceptions.
     * Logs detailed error information and provides structured JSON
     * responses for API requests.
     *
     * @return void
     */
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

    /**
     * Handle JSON response for API exceptions.
     *
     * Formats exception data into a structured JSON response
     * with appropriate status codes and error messages.
     * Includes debug information when application is in debug mode.
     *
     * @param \Throwable $e The exception to handle
     * @return \Illuminate\Http\JsonResponse
     */
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

    /**
     * Get the HTTP status code for an exception.
     *
     * Determines the appropriate HTTP status code based on
     * the exception type. Defaults to 500 for unknown exceptions.
     *
     * @param \Throwable $e The exception to evaluate
     * @return int HTTP status code
     */
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

    /**
     * Get user-friendly error message for an exception.
     *
     * Returns the exception message if available and appropriate,
     * otherwise provides a default message based on the status code.
     * Server errors (5xx) always return generic messages for security.
     *
     * @param \Throwable $e The exception to get message from
     * @param int $statusCode The HTTP status code
     * @return string User-friendly error message
     */
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

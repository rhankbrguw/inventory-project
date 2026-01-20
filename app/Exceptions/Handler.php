<?php

namespace App\Exceptions;

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Throwable;

/**
 * Class Handler
 *
 * Global exception handler for the application.
 * Responsible for reporting exceptions and formatting HTTP / API responses.
 */
class Handler extends ExceptionHandler
{
    /**
     * Custom log levels for exception types.
     *
     * @var array<class-string<Throwable>, \Psr\Log\LogLevel::*>
     */
    protected $levels = [];

    /**
     * Inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register exception handling callbacks.
     *
     * @return void
     */
    public function register(): void
    {
        /**
         * Report exceptions to log storage.
         */
        $this->reportable(function (Throwable $e) {
            if ($this->shouldReport($e)) {
                Log::error('Exception occurred', [
                    'exception' => get_class($e),
                    'message'   => $e->getMessage(),
                    'file'      => $e->getFile(),
                    'line'      => $e->getLine(),
                    'url'       => request()->fullUrl(),
                    'user_id'   => auth()->id(),
                ]);
            }
        });

        /**
         * Render JSON responses for API requests.
         */
        $this->renderable(function (Throwable $e, $request) {
            // Let Laravel handle validation errors by default
            if ($e instanceof ValidationException) {
                return null;
            }

            // Custom JSON response for API requests
            if ($request->is('api/*') && $request->wantsJson()) {
                return $this->handleJsonResponse($e);
            }

            return null;
        });

        /**
         * Handle database duplicate entry errors (unique constraint).
         */
        $this->renderable(function (QueryException $e, $request) {
            if ($e->errorInfo[0] === '23000') {
                $message = $this->getDuplicateEntryMessage($e);

                if ($request->expectsJson() || $request->is('api/*')) {
                    return response()->json([
                        'message'     => $message,
                        'status_code' => 422,
                    ], 422);
                }

                return back()
                    ->withInput()
                    ->with('error', $message);
            }
        });
    }

    /**
     * Generate a human-readable message for duplicate entry errors.
     *
     * @param  QueryException  $e
     * @return string
     */
    private function getDuplicateEntryMessage(QueryException $e): string
    {
        $errorMessage = $e->getMessage();

        if (preg_match("/Duplicate entry '(.+?)' for key '(.+?)'/", $errorMessage, $matches)) {
            $value = $matches[1];
            $key   = $matches[2] ?? '';

            if (preg_match('/\.(\w+)_unique/', $key, $fieldMatches)) {
                $field = $fieldMatches[1];
                $fieldName = $this->getFieldLabel($field);

                return __('validation.unique', ['attribute' => $fieldName]);
            }

            return "Data '{$value}' sudah digunakan.";
        }

        return 'Data yang Anda masukkan sudah ada. Gunakan data yang berbeda.';
    }

    /**
     * Map database field names to user-friendly labels.
     *
     * @param  string  $field
     * @return string
     */
    private function getFieldLabel(string $field): string
    {
        $labels = [
            'name'  => __('validation.attributes.name'),
            'code'  => 'Kode',
            'email' => __('validation.attributes.email'),
            'phone' => __('validation.attributes.phone'),
            'sku'   => 'SKU',
        ];

        return $labels[$field] ?? $field;
    }

    /**
     * Build standardized JSON error response.
     *
     * @param  Throwable  $e
     * @return JsonResponse
     */
    protected function handleJsonResponse(Throwable $e): JsonResponse
    {
        $statusCode = $this->getStatusCode($e);
        $message    = $this->getErrorMessage($e, $statusCode);

        $response = [
            'message'     => $message,
            'status_code' => $statusCode,
        ];

        // Include debug info in development mode
        if (config('app.debug')) {
            $response['debug'] = [
                'exception' => get_class($e),
                'file'      => $e->getFile(),
                'line'      => $e->getLine(),
            ];
        }

        return response()->json($response, $statusCode);
    }

    /**
     * Determine appropriate HTTP status code for an exception.
     *
     * @param  Throwable  $e
     * @return int
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
     * Resolve user-facing error message based on status code.
     *
     * @param  Throwable  $e
     * @param  int        $statusCode
     * @return string
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

<?php

namespace App\Exceptions;

use App\Http\Resources\ApiResponse;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Throwable;

class Handler extends ExceptionHandler
{
    protected $dontFlash = ['current_password', 'password', 'password_confirmation'];

    public function register(): void
    {
        $this->registerReportables();
        $this->registerRenderables();
    }

    private function registerReportables(): void
    {
        $this->reportable(function (Throwable $e) {
            if ($this->shouldReport($e)) {
                $request = app()->bound('request') ? request() : null;
                $userId = app()->bound('auth') && app('auth')->check() ? app('auth')->id() : null;

                app('log')->error('Exception occurred', [
                    'exception' => get_class($e), 'message' => $e->getMessage(),
                    'file' => $e->getFile(), 'line' => $e->getLine(),
                    'url' => $request?->fullUrl(), 'user_id' => $userId,
                ]);
            }
        });
    }

    private function registerRenderables(): void
    {
        $this->renderable(function (Throwable $e, $request) {
            if ($e instanceof ValidationException) {
                return null;
            }
            if ($request->is('api/*') && $request->wantsJson()) {
                return $this->handleJsonResponse($e);
            }
            if (($e instanceof NotFoundHttpException || $e instanceof ModelNotFoundException) && ! $request->is('api/*')) {
                return \Inertia\Inertia::render('Errors/404')->toResponse($request)->setStatusCode(404);
            }

            return null;
        });

        $this->renderable(function (QueryException $e, $request) {
            if ($e->errorInfo[0] === '23000') {
                $msg = $this->getDuplicateEntryMessage($e);
                if ($request->expectsJson() || $request->is('api/*')) {
                    return ApiResponse::error($msg, 'CONFLICT', 409);
                }

                return back()->withInput()->with('error', $msg);
            }
        });
    }

    private function getDuplicateEntryMessage(QueryException $e): string
    {
        if (preg_match("/Duplicate entry '(.+?)' for key '(.+?)'/", $e->getMessage(), $matches)) {
            $key = $matches[2] ?? '';
            if (preg_match('/\.(\w+)_unique/', $key, $fieldMatches)) {
                $labels = ['name' => __('validation.attributes.name'), 'code' => __('validation.attributes.code'), 'email' => __('validation.attributes.email'), 'phone' => __('validation.attributes.phone'), 'sku' => __('validation.attributes.sku')];

                return __('validation.unique', ['attribute' => $labels[$fieldMatches[1]] ?? $fieldMatches[1]]);
            }

            return __('messages.duplicate_entry_value', ['value' => $matches[1]]);
        }

        return __('messages.duplicate_entry_generic');
    }

    protected function handleJsonResponse(Throwable $e): JsonResponse
    {
        $statusCode = $this->getStatusCode($e);
        $message = $this->getErrorMessage($e, $statusCode);
        $code = match ($statusCode) {
            401 => 'UNAUTHENTICATED', 403 => 'UNAUTHORIZED', 404 => 'NOT_FOUND', 409 => 'CONFLICT', 422 => 'VALIDATION_ERROR', default => 'INTERNAL_ERROR'
        };

        return ApiResponse::error($message, $code, $statusCode);
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
        if ($e instanceof HttpException || method_exists($e, 'getStatusCode')) {
            return $e->getStatusCode();
        }

        return 500;
    }

    protected function getErrorMessage(Throwable $e, int $statusCode): string
    {
        $message = $e->getMessage();
        if (empty($message) || $statusCode >= 500) {
            return match ($statusCode) {
                401 => __('messages.http.401'), 403 => __('messages.http.403'), 404 => __('messages.http.404'),
                419 => __('messages.http.419'), 429 => __('messages.http.429'), 500 => __('messages.http.500'),
                default => __('messages.http.default'),
            };
        }

        return $message;
    }
}

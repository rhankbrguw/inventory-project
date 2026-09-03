<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

abstract class AppException extends Exception
{
    public function __construct(
        string $message = '',
        protected string $errorCode = 'INTERNAL_ERROR',
        protected int $statusCode = 500,
        protected ?array $errors = null,
        ?\Throwable $previous = null
    ) {
        parent::__construct($message, $this->statusCode, $previous);
    }

    public function getErrorCode(): string
    {
        return $this->errorCode;
    }

    public function getStatusCode(): int
    {
        return $this->statusCode;
    }

    public function getErrors(): ?array
    {
        return $this->errors;
    }

    public function render(Request $request): JsonResponse|RedirectResponse
    {
        if ($request->expectsJson() || $request->is('api/*')) {
            return response()->json([
                'success' => false,
                'code' => $this->errorCode,
                'message' => $this->getMessage(),
                'errors' => $this->errors,
                'meta' => [
                    'timestamp' => now()->toIso8601String(),
                ],
            ], $this->statusCode);
        }

        return back()
            ->withInput()
            ->with('error', $this->getMessage());
    }
}

<?php

namespace App\Http\Resources;

use Illuminate\Http\JsonResponse;

class ApiResponse
{
    public static function success(mixed $payload = null, string $message = 'Success', string $code = 'OK', int $status = 200, ?array $meta = null): JsonResponse
    {
        return response()->json([
            'success' => true,
            'code' => $code,
            'message' => $message,
            'data' => $payload,
            'meta' => array_merge([
                'timestamp' => now()->toIso8601String(),
            ], $meta ?? []),
        ], $status);
    }

    public static function error(string $message = 'Error', string $code = 'INTERNAL_ERROR', int $status = 500, ?array $errors = null): JsonResponse
    {
        return response()->json([
            'success' => false,
            'code' => $code,
            'message' => $message,
            'errors' => $errors,
            'meta' => [
                'timestamp' => now()->toIso8601String(),
            ],
        ], $status);
    }
}

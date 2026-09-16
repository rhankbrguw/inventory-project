<?php

namespace App\Exceptions;

class ForbiddenException extends AppException
{
    public function __construct(string $message = 'Forbidden access.', ?array $errors = null)
    {
        parent::__construct($message, 'UNAUTHORIZED', 403, $errors);
    }
}

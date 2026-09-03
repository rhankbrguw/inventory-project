<?php

namespace App\Exceptions;

class AuthException extends AppException
{
    public function __construct(string $message = 'Unauthenticated.', ?array $errors = null)
    {
        parent::__construct($message, 'UNAUTHENTICATED', 401, $errors);
    }
}

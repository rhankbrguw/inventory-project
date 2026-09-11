<?php

namespace App\Exceptions;

class ConflictException extends AppException
{
    public function __construct(string $message = 'Resource conflict or duplicate constraint.', ?array $errors = null)
    {
        parent::__construct($message, 'CONFLICT', 409, $errors);
    }
}

<?php

namespace App\Exceptions;

class ValidationException extends AppException
{
    public function __construct(string $message = 'The given data was invalid.', ?array $errors = null)
    {
        parent::__construct($message, 'VALIDATION_ERROR', 422, $errors);
    }
}

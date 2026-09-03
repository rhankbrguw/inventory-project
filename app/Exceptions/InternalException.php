<?php

namespace App\Exceptions;

class InternalException extends AppException
{
    public function __construct(string $message = 'An unexpected internal error occurred.', ?array $errors = null)
    {
        parent::__construct($message, 'INTERNAL_ERROR', 500, $errors);
    }
}

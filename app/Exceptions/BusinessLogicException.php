<?php

namespace App\Exceptions;

class BusinessLogicException extends AppException
{
    public function __construct(string $message = 'Business rule violation.', string $code = 'BUSINESS_LOGIC_ERROR')
    {
        parent::__construct($message, $code, 422);
    }
}

<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class ValidItemTitle implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $normalized = trim((string) $value);

        if ($normalized === '' || mb_strlen($normalized) < 2) {
            $fail(__('validation.valid_item_title'));

            return;
        }

        if (! preg_match('/^[\pL\pN\s\-().,\x27&+\/]+$/u', $normalized) || ! preg_match('/\pL/u', $normalized)) {
            $fail(__('validation.valid_item_title'));

            return;
        }

        if (preg_match('/[\-().,\x27&+\/]{3,}/', $normalized)) {
            $fail(__('validation.valid_item_title'));
        }
    }
}

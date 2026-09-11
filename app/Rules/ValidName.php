<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class ValidName implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $normalized = trim((string) $value);

        if ($normalized === '' || mb_strlen($normalized) < 2) {
            $fail(__('validation.valid_name'));

            return;
        }

        if (! preg_match('/^[\pL\s\-.\x27]+$/u', $normalized)) {
            $fail(__('validation.valid_name'));

            return;
        }

        if (preg_match('/[\-.\x27]{2,}/', $normalized) || preg_match('/^[\-.\x27]|[\-.\x27]$/u', $normalized)) {
            $fail(__('validation.valid_name'));

            return;
        }

        if (preg_match_all('/\pL/u', $normalized) < 2) {
            $fail(__('validation.valid_name'));
        }
    }
}

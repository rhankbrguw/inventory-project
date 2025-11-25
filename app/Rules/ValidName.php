<?php

namespace App\Rules;

use Illuminate\Contracts\Validation\ValidationRule;
use Closure;

class ValidName implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (!preg_match('/^[\pL0-9\s\-\(\)\.\',&]+$/u', $value)) {
            $fail(':attribute hanya boleh berisi huruf, angka, spasi, tanda hubung, tanda kurung, titik, koma, apostrophe, dan ampersand.');
        }
    }
}

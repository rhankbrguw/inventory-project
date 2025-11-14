<?php

namespace App\Rules;

use Illuminate\Contracts\Validation\ValidationRule;
use Closure;

class ValidName implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (!preg_match('/^[\pL\s\-\(\)0-9]+$/u', $value)) {
            $fail(':attribute hanya boleh berisi huruf, angka, spasi, tanda hubung, dan tanda kurung.');
        }
    }
}

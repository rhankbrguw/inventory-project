<?php

namespace App\Rules;

use Illuminate\Contracts\Validation\ValidationRule;
use Closure;

class ValidName implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (!preg_match('/^[\pL\s\-]+$/u', $value)) {
            $fail(':attribute hanya boleh berisi huruf, spasi, dan tanda hubung.');
        }
    }
}

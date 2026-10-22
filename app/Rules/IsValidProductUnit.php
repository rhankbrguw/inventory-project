<?php

namespace App\Rules;

use App\Models\Product;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class IsValidProductUnit implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $units = Product::VALID_UNITS;
        if (! in_array($value, $units)) {
            $fail(__('validation.is_valid_product_unit', ['units' => implode(', ', $units)]));
        }
    }
}

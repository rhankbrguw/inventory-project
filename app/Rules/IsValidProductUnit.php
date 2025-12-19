<?php

namespace App\Rules;

use Illuminate\Contracts\Validation\ValidationRule;
use Closure;

class IsValidProductUnit implements ValidationRule
{
    private array $validUnits = ['kg', 'ons', 'pcs', 'ekor', 'pack', 'box'];

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (!in_array($value, $this->validUnits)) {
            $fail(':attribute harus salah satu dari: ' . implode(', ', $this->validUnits) . '.');
        }
    }
}

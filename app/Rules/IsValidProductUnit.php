<?php

namespace App\Rules;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Support\Arr;
use Closure;

class IsValidProductUnit implements ValidationRule
{
    private array $validUnits = ['kg', 'pcs', 'ekor', 'pack', 'box'];

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (!in_array($value, $this->validUnits)) {
            $fail(':attribute harus salah satu dari: ' . implode(', ', $this->validUnits) . '.');
        }
    }
}

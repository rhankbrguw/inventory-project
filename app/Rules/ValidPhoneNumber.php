<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\DataAwareRule;
use Illuminate\Contracts\Validation\ValidationRule;

class ValidPhoneNumber implements ValidationRule, DataAwareRule
{
    protected $data = [];

    public function setData(array $data): static
    {
        $this->data = $data;
        return $this;
    }

    public static function format(?string $phone): ?string
    {
        if (empty($phone)) {
            return null;
        }

        $cleanedPhone = preg_replace('/\D/', '', $phone);

        if (substr($cleanedPhone, 0, 1) === '0') {
            $cleanedPhone = substr($cleanedPhone, 1);
        }

        if (substr($cleanedPhone, 0, 2) === '62') {
            $cleanedPhone = substr($cleanedPhone, 2);
        }

        return '+62' . $cleanedPhone;
    }

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (empty($value)) {
            return;
        }

        if (!preg_match('/^([0-9\s\-\+\(\)]*)$/', $value)) {
            $fail('validation.regex')->translate();
            return;
        }

        $numericOnly = preg_replace('/[^0-9]/', '', $value);

        if (substr($numericOnly, 0, 2) === '62') {
            $numericOnly = substr($numericOnly, 2);
        }

        if (substr($numericOnly, 0, 1) === '0') {
            $numericOnly = substr($numericOnly, 1);
        }

        $length = strlen($numericOnly);

        if ($length < 8) {
            $fail('validation.min.string')->translate(['min' => 8]);
            return;
        }

        if ($length > 13) {
            $fail('validation.max.string')->translate(['max' => 13]);
            return;
        }

        $firstDigit = substr($numericOnly, 0, 1);
        if (!in_array($firstDigit, ['2', '3', '4', '5', '6', '7', '8', '9'])) {
            $fail('validation.regex')->translate();
            return;
        }

        if ($firstDigit === '8') {
            $secondDigit = substr($numericOnly, 1, 1);
            if (!in_array($secondDigit, ['1', '2', '3', '5', '7', '8', '9'])) {
                $fail('validation.regex')->translate();
                return;
            }
        }
    }
}

<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\DataAwareRule;
use Illuminate\Contracts\Validation\ValidationRule;

class ValidPhoneNumber implements DataAwareRule, ValidationRule
{
    protected array $validationPayload = [];

    public function setData(array $payload): static
    {
        $this->validationPayload = $payload;

        return $this;
    }

    public static function format(?string $phone): ?string
    {
        if (empty($phone)) {
            return null;
        }
        $clean = preg_replace('/\D/', '', $phone);
        if (str_starts_with($clean, '0')) {
            $clean = substr($clean, 1);
        }
        if (str_starts_with($clean, '62')) {
            $clean = substr($clean, 2);
        }

        return '+62'.$clean;
    }

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (empty($value)) {
            return;
        }

        $raw = trim((string) $value);

        if (! preg_match('/^[0-9\s\-+()]+$/', $raw)) {
            $fail(__('validation.valid_phone_number'));

            return;
        }

        $num = $this->normalizeNumericString($raw);
        $len = strlen($num);

        if ($len < 8 || $len > 13) {
            $fail(__('validation.valid_phone_number'));

            return;
        }

        if (! $this->isValidPrefix($num)) {
            $fail(__('validation.valid_phone_number'));
        }
    }

    private function normalizeNumericString(string $rawPhone): string
    {
        $num = preg_replace('/[^0-9]/', '', $rawPhone);
        if (str_starts_with($num, '62')) {
            $num = substr($num, 2);
        }
        if (str_starts_with($num, '0')) {
            $num = substr($num, 1);
        }

        return $num;
    }

    private function isValidPrefix(string $num): bool
    {
        $first = substr($num, 0, 1);
        if (! in_array($first, ['2', '3', '4', '5', '6', '7', '8', '9'], true)) {
            return false;
        }
        if ($first === '8') {
            $second = substr($num, 1, 1);

            return in_array($second, ['1', '2', '3', '5', '7', '8', '9'], true);
        }

        return true;
    }
}

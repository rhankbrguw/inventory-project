<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class ValidEmail implements ValidationRule
{
    private const KNOWN_PROVIDER_PATTERNS = [
        'gmail' => ['gmail.com', 'googlemail.com'],
        'yahoo' => ['yahoo.com', 'yahoo.co.id', 'yahoo.co.uk', 'yahoo.co.jp', 'ymail.com'],
        'outlook' => ['outlook.com', 'outlook.co.id', 'hotmail.com', 'live.com', 'msn.com'],
        'icloud' => ['icloud.com', 'me.com', 'mac.com'],
        'proton' => ['proton.me', 'protonmail.com'],
        'zoho' => ['zoho.com'],
    ];

    private const DISPOSABLE_DOMAINS = [
        'mailinator.com', 'tempmail.com', 'guerrillamail.com', '10minutemail.com',
        'trashmail.com', 'sharklasers.com', 'yopmail.com', 'dispostable.com',
    ];

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $email = strtolower(trim((string) $value));

        if (! filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $fail(__('validation.valid_email'));
            return;
        }

        $parts = explode('@', $email, 2);
        if (count($parts) !== 2) {
            $fail(__('validation.valid_email'));
            return;
        }

        [$local, $domain] = $parts;

        if (! preg_match('/^[a-z0-9]+([._%+-][a-z0-9]+)*$/', $local) || strlen($local) > 64) {
            $fail(__('validation.valid_email'));
            return;
        }

        if (! preg_match('/^[a-z0-9.-]+\.[a-z]{2,}$/', $domain)) {
            $fail(__('validation.invalid_email_domain'));
            return;
        }

        if (in_array($domain, self::DISPOSABLE_DOMAINS, true) || ! $this->validateProviderDomain($domain)) {
            $fail(__('validation.invalid_email_domain'));
        }
    }

    private function validateProviderDomain(string $domain): bool
    {
        $prefix = explode('.', $domain)[0];

        foreach (self::KNOWN_PROVIDER_PATTERNS as $provider => $validDomains) {
            if ($prefix === $provider && ! in_array($domain, $validDomains, true)) {
                return false;
            }
        }

        return true;
    }
}

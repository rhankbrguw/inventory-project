<?php

namespace App\Traits;

use App\Rules\ValidPhoneNumber;

trait FormatsPhoneNumber
{
    protected function prepareForValidation(): void
    {
        $phoneFields = $this->getPhoneFields();

        $formattedData = [];

        foreach ($phoneFields as $field) {
            if ($this->has($field) && !empty($this->input($field))) {
                $formattedData[$field] = ValidPhoneNumber::format($this->input($field));
            }
        }

        if (!empty($formattedData)) {
            $this->merge($formattedData);
        }
    }

    protected function getPhoneFields(): array
    {
        return ['phone'];
    }
}

<?php

namespace App\Rules;

use App\Models\Inventory;
use Closure;
use Illuminate\Contracts\Validation\DataAwareRule;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Support\Str;

class SufficientStock implements DataAwareRule, ValidationRule
{
    protected array $validationPayload = [];

    public function setData(array $payload): static
    {
        $this->validationPayload = $payload;

        return $this;
    }

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $productId = null;
        $locationId = null;

        if (Str::startsWith($attribute, 'items.')) {
            $index = explode('.', $attribute)[1];
            $productId = $this->validationPayload['items'][$index]['product_id'] ?? null;
            $locationId = $this->validationPayload['location_id'] ?? $this->validationPayload['from_location_id'] ?? null;
        } else {
            $productId = $this->validationPayload['product_id'] ?? null;
            $locationId = $this->validationPayload['location_id'] ?? null;
        }

        if (! $productId || ! $locationId) {
            return;
        }

        $inventory = Inventory::where('product_id', $productId)->where('location_id', $locationId)->first();
        $currentStock = $inventory->quantity ?? 0;

        if ($value > $currentStock) {
            $fail(__('validation.sufficient_stock', ['stock' => $currentStock]));
        }
    }
}

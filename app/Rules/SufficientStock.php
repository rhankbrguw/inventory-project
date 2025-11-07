<?php

namespace App\Rules;

use App\Models\Inventory;
use Illuminate\Contracts\Validation\DataAwareRule;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Support\Str;
use Closure;

class SufficientStock implements ValidationRule, DataAwareRule
{
    protected $data = [];

    public function setData(array $data): static
    {
        $this->data = $data;

        return $this;
    }

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $productId = null;
        $locationId = null;

        if (Str::startsWith($attribute, 'items.')) {
            $index = explode('.', $attribute)[1];
            $productId = $this->data['items'][$index]['product_id'] ?? null;

            $locationId = $this->data['location_id'] ?? $this->data['from_location_id'] ?? null;
        } else {
            $productId = $this->data['product_id'] ?? null;
            $locationId = $this->data['location_id'] ?? null;
        }

        if (!$productId || !$locationId) {
            return;
        }

        $inventory = Inventory::where('product_id', $productId)
            ->where('location_id', $locationId)
            ->first();

        $currentStock = $inventory->quantity ?? 0;

        if ($value > $currentStock) {
            $fail('Kuantitas tidak boleh melebihi stok yang tersedia (' . $currentStock . ').');
        }
    }
}

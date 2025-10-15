<?php

namespace App\Http\Requests;

use App\Models\Inventory;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreStockTransferRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'from_location_id' => ['required', 'exists:locations,id'],
            'to_location_id' => ['required', 'exists:locations,id', 'different:from_location_id'],
            'transfer_date' => ['required', 'date'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'exists:products,id', 'distinct'],
            'items.*.quantity' => ['required', 'numeric', 'min:0.01'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $items = $this->input('items', []);
            $fromLocationId = $this->input('from_location_id');

            foreach ($items as $index => $item) {
                $inventory = Inventory::where('product_id', $item['product_id'])
                    ->where('location_id', $fromLocationId)
                    ->first();

                if (!$inventory || $inventory->quantity < $item['quantity']) {
                    $validator->errors()->add(
                        "items.{$index}.quantity",
                        'Jumlah transfer melebihi stok yang tersedia di lokasi asal.'
                    );
                }
            }
        });
    }

    public function messages(): array
    {
        return [
            'to_location_id.different' => 'Lokasi tujuan tidak boleh sama dengan lokasi asal.',
        ];
    }
}

<?php

namespace App\Http\Requests;

use App\Models\Type;
use App\Rules\ExistsInGroup;
use App\Rules\SufficientStock;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSellRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $sellTypeId = Type::where('group', Type::GROUP_TRANSACTION)
            ->where('name', 'Penjualan')
            ->value('id');

        $rules = [
            'type_id' => ['required', 'integer', Rule::in([$sellTypeId])],
            'location_id' => ['required', 'integer', 'exists:locations,id'],
            'customer_id' => ['nullable', 'integer', 'exists:customers,id'],
            'transaction_date' => ['required', 'date'],
            'payment_method_type_id' => ['nullable', 'integer', new ExistsInGroup('types', Type::GROUP_PAYMENT)],
            'notes' => ['nullable', 'string', 'max:1000'],
            'status' => ['required', 'string', Rule::in(['Completed', 'Draft'])],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => [
                'required',
                'integer',
                'exists:products,id,deleted_at,NULL',
                'distinct',
            ],
            'items.*.sell_price' => ['required', 'numeric', 'min:0'],
        ];

        foreach ($this->input('items', []) as $index => $item) {
            $rules["items.{$index}.quantity"] = [
                'required',
                'numeric',
                'min:0.0001',
                new SufficientStock(
                    $this->input('location_id'),
                    $item['product_id'] ?? null
                ),
            ];
        }

        return $rules;
    }

    protected function prepareForValidation(): void
    {
        $sellTypeId = Type::where('group', Type::GROUP_TRANSACTION)
            ->where('name', 'Penjualan')
            ->value('id');

        $this->merge([
            'type_id' => $sellTypeId,
            'status' => $this->status ?? 'Completed',
        ]);
    }
}

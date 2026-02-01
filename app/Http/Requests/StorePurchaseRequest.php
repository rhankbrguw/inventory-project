<?php

namespace App\Http\Requests;

use App\Models\Type;
use App\Rules\ExistsInGroup;
use Illuminate\Foundation\Http\FormRequest;

class StorePurchaseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'location_id' => ['required', 'exists:locations,id'],
            'from_location_id' => ['nullable', 'exists:locations,id'],
            'supplier_id' => ['nullable', 'integer', 'exists:suppliers,id'],
            'transaction_date' => ['required', 'date'],
            'notes' => ['nullable', 'string', 'max:100'],
            'payment_method_type_id' => [
                'nullable',
                'integer',
                new ExistsInGroup('types', Type::GROUP_PAYMENT),
            ],
            'installment_terms' => ['required', 'integer', 'in:1,2,3'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'exists:products,id', 'distinct'],
            'items.*.quantity' => ['required', 'numeric', 'min:0.01'],
            'items.*.cost_per_unit' => ['required', 'numeric', 'min:0.01'],
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $locationId = $this->input('location_id');
            $fromLocationId = $this->input('from_location_id');

            if ($locationId && $fromLocationId && $locationId == $fromLocationId) {
                $validator->errors()->add(
                    'from_location_id',
                    'Lokasi asal tidak boleh sama dengan lokasi tujuan.'
                );
            }
        });
    }
}

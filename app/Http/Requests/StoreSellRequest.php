<?php

namespace App\Http\Requests;

use App\Models\Type;
use App\Models\Location;
use App\Models\Customer;
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
            'sales_channel_id' => ['nullable', 'integer', 'exists:sales_channels,id'],
            'transaction_date' => ['required', 'date'],
            'payment_method_type_id' => ['nullable', 'integer', new ExistsInGroup('types', Type::GROUP_PAYMENT)],
            'installment_terms' => ['required', 'integer', 'in:1,2,3'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'status' => ['required', 'string', Rule::in(['Completed', 'Draft', 'Pending'])],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id,deleted_at,NULL', 'distinct'],
            'items.*.sell_price' => ['required', 'numeric', 'min:0'],
        ];

        foreach (array_keys($this->input('items', [])) as $index) {
            $rules["items.$index.quantity"] = [
                'required',
                'numeric',
                'min:0.0001',
                new SufficientStock(),
            ];
        }
        return $rules;
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $locationId = $this->input('location_id');
            $customerId = $this->input('customer_id');

            if ($locationId && $customerId) {
                $location = Location::with('type')->find($locationId);
                $customer = Customer::find($customerId);

                if ($location && $location->type && $location->type->level === 1) {

                    if (!$customer || empty($customer->related_location_id)) {
                        $validator->errors()->add(
                            'customer_id',
                            'Gudang Pusat hanya boleh melakukan penjualan (distribusi) ke Cabang Internal.'
                        );
                    }
                }
            }
        });
    }

    protected function prepareForValidation(): void
    {
        $sellTypeId = Type::where('group', Type::GROUP_TRANSACTION)
            ->where('name', 'Penjualan')
            ->value('id');

        $status = $this->status;
        $customerId = $this->customer_id;

        if ($customerId) {
            $customer = Customer::find($customerId);
            if ($customer && $customer->related_location_id) {
                $status = 'Pending';
            }
        }

        $this->merge([
            'type_id' => $sellTypeId,
            'status' => $status ?? 'Completed',
        ]);
    }
}

<?php

namespace App\Http\Requests;

use App\Models\Type;
use App\Models\Location;
use App\Models\Customer;
use App\Rules\ExistsInGroup;
use App\Rules\SufficientStock;
use Illuminate\Foundation\Http\FormRequest;

class StoreSellRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = [
            'location_id' => ['required', 'integer', 'exists:locations,id'],
            'customer_id' => ['nullable', 'integer', 'exists:customers,id'],
            'sales_channel_id' => ['nullable', 'integer', new ExistsInGroup('types', Type::GROUP_SALES_CHANNEL)],
            'transaction_date' => ['required', 'date'],
            'payment_method_type_id' => ['nullable', 'integer', new ExistsInGroup('types', Type::GROUP_PAYMENT)],
            'installment_terms' => ['required', 'integer', 'in:1,2,3'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id,deleted_at,NULL'],
            'items.*.sell_price' => ['required', 'numeric', 'min:0'],
            'items.*.sales_channel_id' => ['nullable', 'integer', new ExistsInGroup('types', Type::GROUP_SALES_CHANNEL)],
        ];

        $locationId = $this->input('location_id');
        foreach (array_keys($this->input('items', [])) as $index) {
            $rules["items.$index.quantity"] = [
                'required',
                'numeric',
                'min:0.0001',
                new SufficientStock($locationId),
            ];
        }

        return $rules;
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $locationId = $this->input('location_id');
            $customerId = $this->input('customer_id');

            if ($locationId) {
                $location = Location::with('type')->find($locationId);

                if ($location && $location->type && $location->type->level === 1) {

                    if (empty($customerId)) {
                        $validator->errors()->add(
                            'customer_id',
                            'Gudang Pusat TIDAK BOLEH melayani pelanggan umum (Walk-in). Harap pilih Cabang Tujuan.'
                        );
                        return;
                    }

                    $customer = Customer::find($customerId);
                    if (!$customer || empty($customer->related_location_id)) {
                        $validator->errors()->add(
                            'customer_id',
                            'Gudang Pusat HANYA BOLEH melakukan distribusi ke Cabang (Pelanggan Internal).'
                        );
                    }
                }
            }
        });
    }
}

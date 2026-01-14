<?php

namespace App\Http\Requests;

use App\Models\Type;
use App\Models\Location;
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
            'target_location_id' => ['nullable', 'integer', 'exists:locations,id'],
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
            $targetLocationId = $this->input('target_location_id');

            $sourceLocation = Location::with('type')->find($locationId);

            if ($sourceLocation && $sourceLocation->type) {
                if ($sourceLocation->type->code === Location::CODE_WAREHOUSE) {
                    if ($customerId) {
                        $validator->errors()->add(
                            'customer_id',
                            'Gudang Pusat tidak boleh melayani Pelanggan Perorangan.'
                        );
                    }
                    if (!$targetLocationId) {
                        $validator->errors()->add(
                            'target_location_id',
                            'Gudang Pusat wajib memilih Cabang Tujuan.'
                        );
                    }
                }

                if ($sourceLocation->type->code === Location::CODE_BRANCH) {
                    if ($targetLocationId) {
                        $validator->errors()->add(
                            'target_location_id',
                            'Cabang tidak boleh melakukan penjualan ke Cabang lain.'
                        );
                    }
                }
            }

            if ($customerId && $targetLocationId) {
                $validator->errors()->add(
                    'customer_id',
                    'Pilih salah satu: Pelanggan atau Cabang Tujuan.'
                );
            }

            if ($targetLocationId && $targetLocationId == $locationId) {
                $validator->errors()->add(
                    'target_location_id',
                    'Lokasi tujuan tidak boleh sama dengan lokasi asal.'
                );
            }
        });
    }
}

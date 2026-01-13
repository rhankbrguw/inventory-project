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

            if ($customerId && $targetLocationId) {
                $validator->errors()->add(
                    'customer_id',
                    'Tidak boleh memilih Pelanggan dan Cabang sekaligus. Pilih salah satu.'
                );
                return;
            }

            if ($locationId) {
                $location = Location::with('type')->find($locationId);

                if ($location && $location->type && $location->type->level === 1) {
                    if (empty($customerId) && empty($targetLocationId)) {
                        $validator->errors()->add(
                            'target_location_id',
                            'Gudang Pusat WAJIB memilih Cabang Tujuan. Tidak boleh melayani pelanggan umum (Walk-in).'
                        );
                        return;
                    }

                    if ($customerId) {
                        $customer = Customer::find($customerId);
                        if (!$customer || !$customer->type || $customer->type->code !== Customer::CODE_BRANCH_CUSTOMER) {
                            $validator->errors()->add(
                                'customer_id',
                                'Gudang Pusat hanya boleh melayani Pelanggan Internal (tipe Cabang). Gunakan dropdown "Cabang Tujuan" untuk lebih mudah.'
                            );
                        }
                    }
                }

                if ($targetLocationId && $targetLocationId == $locationId) {
                    $validator->errors()->add(
                        'target_location_id',
                        'Lokasi tujuan tidak boleh sama dengan lokasi penjualan.'
                    );
                }
            }
        });
    }
}

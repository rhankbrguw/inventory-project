<?php

namespace App\Http\Requests;

use App\Traits\FormatsPhoneNumber;
use App\Models\Type;
use App\Models\Customer;
use App\Rules\ExistsInGroup;
use App\Rules\UniqueRule;
use App\Rules\ValidPhoneNumber;
use Illuminate\Foundation\Http\FormRequest;

class UpdateCustomerRequest extends FormRequest
{
    use FormatsPhoneNumber;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $customer = $this->route('customer');

        return [
            'name' => ['required', 'string', 'max:100'],

            'type_id' => [
                'required',
                'integer',
                new ExistsInGroup('types', Type::GROUP_CUSTOMER),
                function ($value, $fail) use ($customer) {
                    $newType = Type::find($value);

                    $customer->load('type');

                    $isCurrentlyCabang =
                        $customer->type &&
                        $customer->type->code === Customer::CODE_BRANCH_CUSTOMER;

                    $isSwitchingToCabang =
                        $newType &&
                        $newType->code === Customer::CODE_BRANCH_CUSTOMER;

                    if ($isCurrentlyCabang && $value != $customer->type_id) {
                        $fail('Pelanggan tipe Cabang (Internal) tidak dapat diubah tipenya.');
                    }

                    if (!$isCurrentlyCabang && $isSwitchingToCabang) {
                        $fail('Anda tidak dapat mengubah pelanggan menjadi tipe Cabang secara manual.');
                    }
                },
            ],

            'email' => [
                'required',
                'string',
                'lowercase',
                'email:rfc,dns',
                'max:50',
                new UniqueRule('customers', $customer->id),
            ],

            'phone' => [
                'nullable',
                'string',
                new ValidPhoneNumber(),
                new UniqueRule('customers', $customer->id, 'phone'),
            ],

            'address' => ['nullable', 'string', 'max:255'],
        ];
    }
}

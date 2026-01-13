<?php

namespace App\Http\Requests;

use App\Traits\FormatsPhoneNumber;
use App\Models\Type;
use App\Models\Customer;
use App\Rules\ExistsInGroup;
use App\Rules\UniqueRule;
use App\Rules\ValidPhoneNumber;
use Illuminate\Foundation\Http\FormRequest;

class StoreCustomerRequest extends FormRequest
{
    use FormatsPhoneNumber;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100'],
            'type_id' => [
                'required',
                'integer',
                new ExistsInGroup('types', Type::GROUP_CUSTOMER),
                function ($value, $fail) {
                    $type = Type::find($value);
                    if ($type && $type->code === Customer::CODE_BRANCH_CUSTOMER) {
                        $fail('Pelanggan tipe Cabang tidak boleh dibuat manual.');
                    }
                }
            ],
            'email' => [
                'required',
                'string',
                'lowercase',
                'email:rfc',
                'max:50',
                new UniqueRule('customers', $this->customer->id ?? null)
            ],
            'phone' => ['nullable', 'string', new ValidPhoneNumber(), new UniqueRule('customers', null, 'phone')],
            'address' => ['nullable', 'string', 'max:255'],
        ];
    }
}

<?php

namespace App\Http\Requests;

use App\Traits\FormatsPhoneNumber;
use App\Models\Type;
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
            'type_id' => ['required', 'integer', new ExistsInGroup('types', Type::GROUP_CUSTOMER)],
            'email' => ['required', 'string', 'lowercase', 'email:rfc,dns', 'max:50', new UniqueRule('customers', null, 'email')],
            'phone' => ['nullable', 'string', new ValidPhoneNumber(), new UniqueRule('customers', null, 'phone')],
            'address' => ['nullable', 'string', 'max:255'],
        ];
    }
}

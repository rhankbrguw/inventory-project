<?php

namespace App\Http\Requests;

use App\Models\Type;
use App\Rules\ExistsInGroup;
use App\Rules\UniqueRule;
use App\Rules\ValidEmail;
use App\Rules\ValidName;
use App\Rules\ValidPhoneNumber;
use App\Traits\FormatsPhoneNumber;
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
            'name' => ['required', 'string', 'max:100', new ValidName],
            'type_id' => [
                'required',
                'integer',
                new ExistsInGroup('types', Type::GROUP_CUSTOMER),
            ],
            'email' => [
                'required',
                'string',
                'lowercase',
                'max:50',
                new ValidEmail,
                new UniqueRule('customers', $this->customer->id ?? null),
            ],
            'phone' => ['nullable', 'string', new ValidPhoneNumber, new UniqueRule('customers', null, 'phone')],
            'address' => ['nullable', 'string', 'max:255'],
        ];
    }
}

<?php

namespace App\Http\Requests;

use App\Models\Type;
use App\Rules\ExistsInGroup;
use App\Rules\UniqueRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreCustomerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100'],
            'type_id' => ['required', 'integer', new ExistsInGroup('types', Type::GROUP_CUSTOMER)],
            'email' => ['required', 'email:rfc,dns', 'max:50', new UniqueRule('customers', null, 'email')],
            'phone' => ['nullable', 'string', 'min:10', 'max:15', new UniqueRule('customers', null, 'phone')],
            'address' => ['nullable', 'string', 'max:255'],
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->phone) {
            $cleanedPhone = preg_replace('/\D/', '', $this->phone);

            if (substr($cleanedPhone, 0, 1) === '0') {
                $cleanedPhone = substr($cleanedPhone, 1);
            }

            $this->merge([
                'phone' => '+62' . $cleanedPhone
            ]);
        }
    }
}

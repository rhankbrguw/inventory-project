<?php

namespace App\Http\Requests;

use App\Models\Type;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCustomerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100'],
            'type_id' => ['required', 'integer', Rule::exists('types', 'id')->where('group', Type::GROUP_CUSTOMER)],
            'email' => ['required', 'email:rfc,dns', 'max:50', Rule::unique('customers', 'email')->ignore($this->customer->id)],
            'phone' => ['nullable', 'string', 'min:10', 'max:15', Rule::unique('customers', 'phone')->ignore($this->customer->id)],
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

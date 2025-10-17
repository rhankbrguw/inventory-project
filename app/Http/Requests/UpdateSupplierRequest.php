<?php

namespace App\Http\Requests;

use App\Rules\UniqueRule;
use App\Rules\ValidName;
use Illuminate\Foundation\Http\FormRequest;

class UpdateSupplierRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:50', new ValidName, new UniqueRule('suppliers', $this->supplier->id, 'name')],
            'contact_person' => ['required', 'string', 'max:50', new ValidName],
            'email' => ['required', 'string', 'lowercase', 'email:rfc,dns', 'max:50', new UniqueRule('suppliers', $this->supplier->id, 'email')],
            'phone' => ['required', 'string', 'min:10', 'max:15', new UniqueRule('suppliers', $this->supplier->id, 'phone')],
            'address' => ['required', 'string', 'max:150'],
            'notes' => ['nullable', 'string', 'max:100'],
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

<?php

namespace App\Http\Requests;

use App\Rules\UniqueRule;
use App\Rules\ValidEmail;
use App\Rules\ValidName;
use App\Rules\ValidPhoneNumber;
use App\Traits\FormatsPhoneNumber;
use Illuminate\Foundation\Http\FormRequest;

class UpdateSupplierRequest extends FormRequest
{
    use FormatsPhoneNumber;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:50', new ValidName, new UniqueRule('suppliers', $this->supplier->id, 'name')],
            'contact_person' => ['required', 'string', 'max:50', new ValidName],
            'email' => ['required', 'string', 'lowercase', 'max:50', new ValidEmail, new UniqueRule('suppliers', $this->supplier->id, 'email')],
            'phone' => ['required', 'string', new ValidPhoneNumber, new UniqueRule('suppliers', $this->supplier->id, 'phone')],
            'address' => ['required', 'string', 'max:150'],
            'notes' => ['nullable', 'string', 'max:100'],
        ];
    }
}

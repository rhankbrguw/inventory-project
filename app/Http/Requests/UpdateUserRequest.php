<?php

namespace App\Http\Requests;

use App\Traits\FormatsPhoneNumber;
use App\Rules\UniqueRule;
use App\Rules\ValidName;
use App\Rules\ValidPhoneNumber;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    use FormatsPhoneNumber;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:50', new ValidName()],
            'email' => [
                'required',
                'string',
                'lowercase',
                'email:rfc,dns',
                'max:50',
                Rule::unique('users')->ignore($this->user->id),
            ],
            'phone' => [
                'nullable',
                'string',
                new ValidPhoneNumber(),
                new UniqueRule('users', $this->user->id, 'phone'),
            ],
            'role' => ['required', 'string'],
        ];
    }
}

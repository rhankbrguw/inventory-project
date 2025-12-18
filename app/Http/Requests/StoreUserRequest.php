<?php

namespace App\Http\Requests;

use App\Traits\FormatsPhoneNumber;
use App\Models\User;
use App\Rules\UniqueRule;
use App\Rules\ValidName;
use App\Rules\ValidPhoneNumber;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class StoreUserRequest extends FormRequest
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
                'unique:' . User::class,
            ],
            'phone' => [
                'nullable',
                'string',
                new ValidPhoneNumber(),
                new UniqueRule('users', null, 'phone'),
            ],
            'password' => [
                'required',
                'confirmed',
                Password::min(8)->letters()->numbers(),
            ],
            'role' => ['required', 'string', 'exists:roles,name'],
            'location_ids' => ['nullable', 'array'],
            'location_ids.*' => ['exists:locations,id'],
        ];
    }
}

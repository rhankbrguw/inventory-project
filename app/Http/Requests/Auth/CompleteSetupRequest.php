<?php

namespace App\Http\Requests\Auth;

use App\Rules\UniqueRule;
use App\Rules\ValidEmail;
use App\Rules\ValidName;
use App\Rules\ValidPhoneNumber;
use App\Traits\FormatsPhoneNumber;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class CompleteSetupRequest extends FormRequest
{
    use FormatsPhoneNumber;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:50', new ValidName],
            'email' => ['required', 'string', 'lowercase', 'max:50', new ValidEmail, new UniqueRule('users')],
            'phone' => ['nullable', 'string', new ValidPhoneNumber, new UniqueRule('users', null, 'phone')],
            'password' => [
                'required',
                'confirmed',
                Password::min(8)->letters()->numbers(),
            ],
        ];
    }
}

<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class UpdatePasswordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'current_password' => ['required', 'current_password'],
            'password' => [
                'required',
                'confirmed',
                'different:current_password',
                Password::min(8)
                    ->letters()
                    ->numbers()
                    ->uncompromised(),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'current_password.required' => __('validation.password.current_required'),
            'current_password.current_password' => __('validation.password.current_incorrect'),
            'password.required' => __('validation.password.required'),
            'password.confirmed' => __('validation.password.confirmed'),
            'password.different' => __('validation.password.different'),
        ];
    }
}

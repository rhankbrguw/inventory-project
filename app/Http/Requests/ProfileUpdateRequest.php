<?php

namespace App\Http\Requests;

use App\Models\User;
use App\Rules\ValidEmail;
use App\Rules\ValidName;
use App\Rules\ValidPhoneNumber;
use App\Traits\FormatsPhoneNumber;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProfileUpdateRequest extends FormRequest
{
    use FormatsPhoneNumber;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:2', 'max:50', new ValidName],
            'email' => [
                'required',
                'string',
                'lowercase',
                'max:255',
                new ValidEmail,
                Rule::unique(User::class)->ignore($this->user()->id),
            ],
            'phone' => [
                'nullable',
                'string',
                new ValidPhoneNumber,
                Rule::unique(User::class)->ignore($this->user()->id),
            ],
        ];
    }
}

<?php

namespace App\Http\Requests;

use App\Rules\UniqueRule;
use App\Rules\ValidEmail;
use App\Rules\ValidName;
use App\Rules\ValidPhoneNumber;
use App\Traits\FormatsPhoneNumber;
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
            'name' => ['required', 'string', 'max:50', new ValidName],
            'email' => [
                'required',
                'string',
                'lowercase',
                'max:50',
                new ValidEmail,
                Rule::unique('users')->ignore($this->user->id),
            ],
            'phone' => [
                'nullable',
                'string',
                new ValidPhoneNumber,
                new UniqueRule('users', $this->user->id, 'phone'),
            ],
            'role' => ['required', 'string'],
        ];
    }
}

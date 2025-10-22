<?php

namespace App\Http\Requests;

use App\Models\User;
use App\Rules\UniqueRule;
use App\Rules\ValidName;
use Illuminate\Foundation\Http\FormRequest;

class ProfileUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:50', new ValidName],
            'email' => ['required', 'string', 'lowercase', 'email:rfc,dns', 'max:50', new UniqueRule('users', $this->user()->id)],
        ];
    }
}

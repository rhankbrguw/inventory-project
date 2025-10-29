<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Rules\ValidName;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            "name" => ["required", "string", "max:50", new ValidName()],
            "email" => [
                "required",
                "string",
                "lowercase",
                "email:rfc,dns",
                "max:50",
                Rule::unique("users")->ignore($this->user->id),
            ],
            "role" => ["required", "string", "exists:roles,name"],
        ];
    }
}

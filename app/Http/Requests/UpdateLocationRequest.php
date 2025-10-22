<?php

namespace App\Http\Requests;

use App\Models\Type;
use App\Rules\ExistsInGroup;
use App\Rules\ValidRoleForLocationType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateLocationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100', Rule::unique('locations')->ignore($this->location)],
            'type_id' => ['required', 'integer', new ExistsInGroup('types', Type::GROUP_LOCATION)],
            'address' => ['nullable', 'string', 'max:150'],
            'assignments' => ['present', 'array'],
            'assignments.*.user_id' => ['required', 'exists:users,id'],
            'assignments.*.role_id' => ['required', 'exists:roles,id', new ValidRoleForLocationType],
        ];
    }
}

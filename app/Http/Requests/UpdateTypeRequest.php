<?php

namespace App\Http\Requests;

use App\Models\Type;
use App\Rules\UniqueRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTypeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:50', (new UniqueRule('types', $this->type->id))->where('group', $this->group)],
            'group' => ['required', Rule::in(array_keys(Type::getAvailableGroups()))],
            'code' => ['nullable', 'string', 'max:50', (new UniqueRule('types', $this->type->id))->where('deleted_at', null)],
            'level' => [
                'nullable',
                'integer',
                'min:1',
                'max:100',
                Rule::requiredIf($this->group === Type::GROUP_USER_ROLE)
            ],
        ];
    }
}

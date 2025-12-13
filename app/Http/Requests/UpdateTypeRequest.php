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
        $user = $this->user();
        $type = $this->route('type');

        if ($user->level === 1) {
            return true;
        }

        if ($user->level <= 10) {
            return $type->group === Type::GROUP_PRODUCT && $this->input('group') === Type::GROUP_PRODUCT;
        }

        return false;
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
                Rule::requiredIf(fn() => in_array($this->group, [Type::GROUP_USER_ROLE, Type::GROUP_LOCATION]))
            ],
        ];
    }
}

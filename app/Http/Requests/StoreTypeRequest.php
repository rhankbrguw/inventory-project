<?php

namespace App\Http\Requests;

use App\Models\Type;
use App\Models\Role;
use App\Rules\UniqueRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTypeRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        if (Role::isSuperAdmin($user->level)) {
            return true;
        }

        if (Role::isManagerial($user->level)) {
            return $this->input('group') === Type::GROUP_PRODUCT;
        }

        return false;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:50', (new UniqueRule('types'))->where('group', $this->group)],
            'group' => ['required', Rule::in(array_keys(Type::getAvailableGroups()))],
            'code' => ['nullable', 'string', 'max:50', (new UniqueRule('types'))->where('deleted_at', null)],
            'level' => [
                'nullable',
                'integer',
                'min:1',
                'max:100',
                function ($value, $fail) {
                    if (!Role::isSuperAdmin($this->user()->level) && $value < $this->user()->level) {
                        $fail("Anda tidak dapat membuat level akses yang lebih tinggi dari level Anda sendiri.");
                    }
                },
                Rule::requiredIf(fn() => in_array($this->group, [Type::GROUP_USER_ROLE, Type::GROUP_LOCATION]))
            ],
        ];
    }
}

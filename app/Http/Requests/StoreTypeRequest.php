<?php

namespace App\Http\Requests;

use App\Models\Type;
use App\Rules\UniqueRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTypeRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        if ($user->hasRole('Super Admin')) {
            return true;
        }

        if ($user->hasRole('Branch Manager')) {
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
                Rule::requiredIf($this->group === Type::GROUP_USER_ROLE)
            ],
        ];
    }
}

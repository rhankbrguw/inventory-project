<?php

namespace App\Http\Requests;

use App\Models\Type;
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
      $typeId = $this->type->id;

      return [
         'name' => ['required', 'string', 'max:50', Rule::unique('types')->where('group', $this->group)->ignore($typeId)],
         'group' => ['required', Rule::in(array_keys(Type::getAvailableGroups()))],
         'code' => ['nullable', 'string', 'max:50', Rule::unique('types', 'code')->ignore($typeId)->whereNull('deleted_at')],
      ];
   }
}

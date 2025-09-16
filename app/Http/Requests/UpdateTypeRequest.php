<?php

namespace App\Http\Requests;

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
         'name' => [
            'required',
            'string',
            'max:255',
            Rule::unique('types')->where('group', $this->group)->ignore($typeId)
         ],
         'group' => ['required', 'string', 'max:50', 'regex:/^[a-z0-9_]+$/'],
         'code' => ['nullable', 'string', 'max:10', Rule::unique('types')->ignore($typeId)],
      ];
   }
}

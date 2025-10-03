<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Models\Type;

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
         'type_id' => [
            'required',
            'integer',
            Rule::exists('types', 'id')->where('group', Type::GROUP_LOCATION),
         ],
         'address' => 'nullable|string|max:100',
         'assignments' => 'nullable|array',
         'assignments.*.user_id' => 'required|exists:users,id',
         'assignments.*.role_id' => 'required|exists:roles,id',
      ];
   }
}

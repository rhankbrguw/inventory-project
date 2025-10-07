<?php

namespace App\Http\Requests;

use App\Models\Type;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreLocationRequest extends FormRequest
{
   public function authorize(): bool
   {
      return true;
   }

   public function rules(): array
   {
      return [
         'name' => ['required', 'string', 'max:100', Rule::unique('locations')->ignore($this->location)],
         'type_id' => ['required', 'integer', Rule::exists('types', 'id')->where('group', Type::GROUP_LOCATION)],
         'address' => ['nullable', 'string', 'max:150'],
      ];
   }
}

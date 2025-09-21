<?php

namespace App\Http\Requests;

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
         return $this->input('group') === 'product_type';
      }

      return false;
   }

   public function rules(): array
   {
      return [
         'name' => [
            'required',
            'string',
            'max:50',
            Rule::unique('types')->where('group', $this->group),
         ],
         'group' => ['required', 'string', 'max:100', 'regex:/^[a-z0-9_]+$/'],
         'code' => 'nullable|string|max:50|unique:types,code',
      ];
   }
}

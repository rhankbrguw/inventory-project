<?php

namespace App\Http\Requests;

use App\Models\Type;
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
         'name' => [
            'required',
            'string',
            'max:50',
            Rule::unique('types')->where('group', $this->group),
         ],
         'group' => [
            'required',
            Rule::in(array_keys(Type::getAvailableGroups())),
         ],
         'code' => [
            'nullable',
            'string',
            'max:50',
            Rule::unique('types', 'code')->whereNull('deleted_at'),
         ],
      ];
   }
}

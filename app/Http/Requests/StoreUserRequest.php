<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class StoreUserRequest extends FormRequest
{
   public function authorize(): bool
   {
      return true;
   }

   public function rules(): array
   {
      return [
         'name' => ['required', 'string', 'max:50', 'regex:/^[\pL\s\-]+$/u'],
         'email' => ['required', 'string', 'lowercase', 'email:rfc,dns', 'max:50', Rule::unique('users')],
         'password' => ['required', 'string', 'confirmed', Password::defaults()],
         'role' => ['required', 'string', 'exists:roles,name'],
      ];
   }
}

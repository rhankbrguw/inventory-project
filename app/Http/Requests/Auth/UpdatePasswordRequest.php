<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class UpdatePasswordRequest extends FormRequest
{
   public function authorize(): bool
   {
      return true;
   }

   public function rules(): array
   {
      return [
         'current_password' => ['required', 'string', 'current_password'],
         'password' => ['required', 'string', 'confirmed', 'different:current_password', Password::defaults()],
      ];
   }

   public function messages(): array
   {
      return [
         'current_password.current_password' => 'Password saat ini tidak sesuai.',
         'password.different' => 'Password baru tidak boleh sama dengan password saat ini.',
         'password.confirmed' => 'Konfirmasi password tidak sesuai.',
      ];
   }

   public function attributes(): array
   {
      return [
         'current_password' => 'password saat ini',
         'password' => 'password baru',
      ];
   }
}

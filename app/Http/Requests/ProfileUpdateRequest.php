<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProfileUpdateRequest extends FormRequest
{
   public function authorize(): bool
   {
      return true;
   }

   public function rules(): array
   {
      return [
         'name' => ['required', 'string', 'max:50'],
         'email' => ['required', 'string', 'lowercase', 'email:rfc,dns', 'max:50', Rule::unique(User::class)->ignore($this->user()->id)],
      ];
   }
}

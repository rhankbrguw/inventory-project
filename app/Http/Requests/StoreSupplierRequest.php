<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSupplierRequest extends FormRequest
{
   public function authorize(): bool
   {
      return true;
   }

   public function rules(): array
   {
      return [
         'name' => ['required', 'string', 'max:50', 'regex:/^[\pL\s\-]+$/u', Rule::unique('suppliers')],
         'contact_person' => ['required', 'string', 'max:50', 'regex:/^[\pL\s\-]+$/u'],
         'email' => ['required', 'string', 'lowercase', 'email:rfc,dns', 'max:50', Rule::unique('suppliers')],
         'phone' => ['required', 'string', 'min:10', 'max:15', Rule::unique('suppliers')],
         'address' => ['required', 'string', 'max:150'],
         'notes' => ['nullable', 'string', 'max:100'],
      ];
   }

   protected function prepareForValidation(): void
   {
      if ($this->phone) {
         $cleanedPhone = preg_replace('/\D/', '', $this->phone);

         if (substr($cleanedPhone, 0, 1) === '0') {
            $cleanedPhone = substr($cleanedPhone, 1);
         }

         $this->merge([
            'phone' => '+62' . $cleanedPhone
         ]);
      }
   }
}

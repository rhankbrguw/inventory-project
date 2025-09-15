<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSupplierRequest extends FormRequest
{

   public function authorize(): bool
   {
      return true;
   }

   /**
    *
    *
    * @return array<string,
    */
   public function rules(): array
   {
      $supplierId = $this->supplier->id;

      return [
         'name' => ['required', 'string', 'max:50', 'regex:/^[\pL\s\-]+$/u'],
         'contact_person' => ['required', 'string', 'max:50', 'regex:/^[\pL\s\-]+$/u'],
         'email' => ['required', 'email', 'max:255', Rule::unique('suppliers')->ignore($supplierId)],
         'phone' => ['required', 'string', 'max:25', Rule::unique('suppliers')->ignore($supplierId)],
         'address' => ['required', 'string', 'max:1000'],
         'notes' => ['nullable', 'string', 'max:1000'],
      ];
   }

   protected function prepareForValidation()
   {
      if ($this->phone) {
         $this->merge([
            'phone' => '+62' . preg_replace('/\D/', '', $this->phone)
         ]);
      }
   }
}

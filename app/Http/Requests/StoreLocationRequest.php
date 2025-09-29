<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreLocationRequest extends FormRequest
{
   public function authorize(): bool
   {
      return true;
   }

   public function rules(): array
   {
      return [
         'name' => 'required|string|max:100|unique:locations,name',
         'type' => 'required|string|in:warehouse,branch',
         'address' => 'nullable|string|max:1000',
      ];
   }
}

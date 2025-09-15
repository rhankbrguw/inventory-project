<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProductRequest extends FormRequest
{
   public function authorize(): bool
   {
      return true;
   }

   public function rules(): array
   {
      return [
         'name' => ['required', 'string', 'max:50', 'regex:/[a-zA-Z]/'],
         'sku' => 'required|string|max:50|unique:products,sku',
         'price' => 'required|numeric|min:0|max:9999999999999.99',
         'unit' => ['required', Rule::in(['kg', 'pcs', 'ekor', 'pack', 'box'])],
         'description' => 'nullable|string|max:1000',
         'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
      ];
   }
}

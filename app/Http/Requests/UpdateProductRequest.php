<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProductRequest extends FormRequest
{
   public function authorize(): bool
   {
      return true;
   }

   public function rules(): array
   {
      $productId = $this->route('product')->id;

      return [
         'name' => ['required', 'string', 'max:255', 'regex:/[a-zA-Z]/'],
         'sku' => ['required', 'string', 'max:255', Rule::unique('products')->ignore($productId)],
         'price' => 'required|numeric|min:0',
         'unit' => ['required', Rule::in(['kg', 'pcs', 'ekor', 'pack', 'box'])],
         'description' => 'nullable|string',
         'branches' => 'present|array',
         'branches.*' => 'integer|exists:locations,id',
      ];
   }
}

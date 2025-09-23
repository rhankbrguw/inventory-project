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
      $productId = $this->product->id;

      return [
         'name' => ['required', 'string', 'max:50', 'regex:/^[\pL\s\-]+$/u'],
         'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
         'type_id' => 'required|exists:types,id',
         'default_supplier_id' => 'nullable|exists:suppliers,id',
         'sku' => ['required', 'string', 'max:50', Rule::unique('products')->ignore($productId)],
         'price' => 'required|numeric|min:0',
         'unit' => ['required', Rule::in(['kg', 'pcs', 'ekor', 'pack', 'box'])],
         'description' => 'nullable|string|max:50',
      ];
   }
}

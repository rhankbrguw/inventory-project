<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AdjustStockRequest extends FormRequest
{
   public function authorize(): bool
   {
      return true;
   }

   public function rules(): array
   {
      return [
         'product_id' => 'required|exists:products,id',
         'location_id' => 'required|exists:locations,id',
         'quantity' => 'required|numeric|min:0',
         'notes' => 'required|string|max:1000',
      ];
   }
}

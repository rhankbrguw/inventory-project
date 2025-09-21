<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePurchaseRequest extends FormRequest
{
   public function authorize(): bool
   {
      return true;
   }

   public function rules(): array
   {
      return [
         'location_id' => 'required|exists:locations,id',
         'supplier_id' => 'required|exists:suppliers,id',
         'transaction_date' => 'required|date',
         'notes' => 'nullable|string|max:100',
         'items' => 'required|array|min:1',
         'items.*.product_id' => 'required|exists:products,id',
         'items.*.quantity' => 'required|numeric|min:1',
         'items.*.cost_per_unit' => 'required|numeric|min:0',
      ];
   }
}

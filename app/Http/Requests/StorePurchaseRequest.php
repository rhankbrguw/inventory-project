<?php

namespace App\Http\Requests;

use App\Models\Type;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePurchaseRequest extends FormRequest
{
   public function authorize(): bool
   {
      return true;
   }

   public function rules(): array
   {
      return [
         'location_id' => ['required', 'exists:locations,id'],
         'supplier_id' => ['required', 'exists:suppliers,id'],
         'transaction_date' => ['required', 'date'],
         'notes' => ['nullable', 'string', 'max:1000'],
         'payment_method_type_id' => ['nullable', 'integer', Rule::exists('types', 'id')->where('group', Type::GROUP_PAYMENT)],
         'items' => ['required', 'array', 'min:1'],
         'items.*.product_id' => ['required', 'exists:products,id'],
         'items.*.quantity' => ['required', 'numeric', 'min:0.01'],
         'items.*.cost_per_unit' => ['required', 'numeric', 'min:0'],
      ];
   }
}

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
            'product_id' => ['required', 'integer', 'exists:products,id,deleted_at,NULL'],
            'location_id' => ['required', 'integer', 'exists:locations,id,deleted_at,NULL'],
            'quantity' => ['required', 'numeric', 'min:0'],
            'notes' => ['required', 'string', 'max:1000'],
        ];
    }
}

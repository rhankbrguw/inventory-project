<?php

namespace App\Http\Requests;

use App\Rules\SufficientStock;
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
            'product_id' => ['required', 'exists:products,id'],
            'location_id' => ['required', 'exists:locations,id'],
            'reason' => ['required', 'string'],
            'quantity' => ['required', 'numeric', 'min:0', new SufficientStock],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}

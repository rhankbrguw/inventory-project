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
            'name' => ['required', 'string', 'max:255', 'regex:/[a-zA-Z]/'],
            'sku' => 'required|string|max:255|unique:products,sku',
            'price' => 'required|numeric|min:0',
            'unit' => ['required', Rule::in(['kg', 'pcs', 'ekor', 'pack', 'box'])],
            'stock_quantity' => 'required|integer|min:0',
            'description' => 'nullable|string',
        ];
    }
}

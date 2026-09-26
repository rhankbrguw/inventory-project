<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePurchaseCartItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->cartItem);
    }

    public function rules(): array
    {
        return [
            'quantity' => ['sometimes', 'required', 'numeric', 'min:1'],
            'cost_per_unit' => ['sometimes', 'required', 'numeric', 'min:0'],
        ];
    }
}

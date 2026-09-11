<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSellCartItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->cartItem);
    }

    public function rules(): array
    {
        return [
            'quantity' => ['required', 'numeric', 'min:0.0001'],
        ];
    }
}

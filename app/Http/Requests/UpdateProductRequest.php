<?php

namespace App\Http\Requests;

use App\Models\Type;
use App\Rules\ExistsInGroup;
use App\Rules\IsValidProductUnit;
use App\Rules\UniqueRule;
use App\Rules\ValidName;
use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:50', new ValidName()],
            'image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif', 'max:2048'],
            'type_id' => ['required', 'integer', new ExistsInGroup('types', Type::GROUP_PRODUCT)],

            'suppliers' => ['nullable', 'array'],
            'suppliers.*' => ['exists:suppliers,id'],

            'default_supplier_id' => ['nullable', 'exists:suppliers,id'],
            'sku' => ['required', 'string', 'max:50', new UniqueRule('products', $this->product->id)],
            'price' => ['required', 'numeric', 'min:0'],
            'unit' => ['required', new IsValidProductUnit()],
            'description' => ['nullable', 'string', 'max:1000'],
        ];
    }
}

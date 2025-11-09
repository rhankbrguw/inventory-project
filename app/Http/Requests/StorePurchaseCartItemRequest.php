<?php

namespace App\Http\Requests;

use App\Rules\UniqueRule;
use Illuminate\Foundation\Http\FormRequest;

class StorePurchaseCartItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $supplierId = $this->input("supplier_id");

        $uniqueProductRule = new UniqueRule("purchase_cart_items");
        $uniqueProductRule->where("user_id", $this->user()->id);

        if (is_null($supplierId)) {
            $uniqueProductRule->where("supplier_id", null);
        } else {
            $uniqueProductRule->where("supplier_id", $supplierId);
        }

        return [
            "product_id" => [
                "required",
                "integer",
                "exists:products,id,deleted_at,NULL",
                $uniqueProductRule,
            ],
            "supplier_id" => [
                "nullable",
                "integer",
                "exists:suppliers,id",
            ],
            "quantity" => ["nullable", "numeric", "min:0.0001"],
            "cost_per_unit" => ["nullable", "numeric", "min:0"],
        ];
    }
}

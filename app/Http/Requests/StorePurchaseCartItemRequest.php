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
        $uniqueProductRule = new UniqueRule("purchase_cart_items");
        $uniqueProductRule->where("user_id", $this->user()->id);
        $uniqueProductRule->where("supplier_id", $this->input("supplier_id"));

        return [
            "product_id" => [
                "required",
                "integer",
                "exists:products,id,deleted_at,NULL",
                $uniqueProductRule,
            ],
            "supplier_id" => ["required", "integer", "exists:suppliers,id"],
            "quantity" => ["nullable", "numeric", "min:0.0001"],
            "cost_per_unit" => ["nullable", "numeric", "min:0"],
        ];
    }
}

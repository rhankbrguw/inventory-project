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
        return [
            "product_id" => [
                "required",
                "integer",
                "exists:products,id,deleted_at,NULL",
                new UniqueRule("purchase_cart_items")
                    ->where("user_id", $this->user()->id)
                    ->where("supplier_id", $this->input("supplier_id")),
            ],
            "supplier_id" => ["required", "integer", "exists:suppliers,id"],
            "quantity" => ["nullable", "numeric", "min:0.0001"],
            "cost_per_unit" => ["nullable", "numeric", "min:0"],
        ];
    }
}

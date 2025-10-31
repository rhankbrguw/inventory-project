<?php
namespace App\Http\Requests;

use App\Rules\UniqueRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreSellCartItemRequest extends FormRequest
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
                new UniqueRule("sell_cart_items")
                    ->where("user_id", $this->user()->id)
                    ->where("location_id", $this->input("location_id")),
            ],
            "location_id" => ["required", "integer", "exists:locations,id"],
            "quantity" => ["nullable", "numeric", "min:0.0001"],
        ];
    }
}

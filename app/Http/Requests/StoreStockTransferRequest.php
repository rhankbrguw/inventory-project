<?php

namespace App\Http\Requests;

use App\Rules\SufficientStock;
use Illuminate\Foundation\Http\FormRequest;

class StoreStockTransferRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            "from_location_id" => ["required", "exists:locations,id"],
            "to_location_id" => [
                "required",
                "exists:locations,id",
                "different:from_location_id",
            ],
            "notes" => ["nullable", "string", "max:1000"],
            "items" => ["required", "array", "min:1"],
            "items.*.product_id" => [
                "required",
                "exists:products,id",
                "distinct",
            ],
            "items.*.quantity" => [
                "required",
                "numeric",
                "min:0.01",
                new SufficientStock(),
            ],
        ];
    }
}

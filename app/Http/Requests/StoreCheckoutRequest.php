<?php

namespace App\Http\Requests;

use App\Models\Type;
use App\Rules\ExistsInGroup;
use Illuminate\Foundation\Http\FormRequest;

class StoreCheckoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            "location_id" => ["required", "integer", "exists:locations,id"],
            "supplier_id" => ["required", "integer", "exists:suppliers,id"],
            "transaction_date" => ["required", "date"],
            "notes" => ["nullable", "string", "max:100"],
            "payment_method_type_id" => [
                "nullable",
                "integer",
                new ExistsInGroup("types", Type::GROUP_PAYMENT),
            ],
        ];
    }
}

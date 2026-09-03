<?php

namespace App\Http\Requests;

use App\Models\Location;
use App\Models\Type;
use App\Rules\ExistsInGroup;
use App\Rules\SufficientStock;
use Illuminate\Foundation\Http\FormRequest;

class StoreSellRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = [
            'location_id' => ['required', 'integer', 'exists:locations,id'],
            'customer_id' => ['nullable', 'integer', 'exists:customers,id'],
            'target_location_id' => ['nullable', 'integer', 'exists:locations,id'],
            'sales_channel_id' => ['nullable', 'integer', new ExistsInGroup('types', Type::GROUP_SALES_CHANNEL)],
            'transaction_date' => ['required', 'date'],
            'payment_method_type_id' => ['nullable', 'integer', new ExistsInGroup('types', Type::GROUP_PAYMENT)],
            'installment_terms' => ['required', 'integer', 'in:1,2,3'],
            'interest_rate' => ['sometimes', 'numeric', 'min:0', 'max:100'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id,deleted_at,NULL'],
            'items.*.sell_price' => ['required', 'numeric', 'min:0'],
            'items.*.sales_channel_id' => ['nullable', 'integer', new ExistsInGroup('types', Type::GROUP_SALES_CHANNEL)],
        ];

        $locationId = $this->input('location_id');
        foreach (array_keys($this->input('items', [])) as $index) {
            $rules["items.$index.quantity"] = ['required', 'numeric', 'min:0.0001', new SufficientStock($locationId)];
        }

        return $rules;
    }

    public function withValidator(\Illuminate\Validation\Validator $validator): void
    {
        $validator->after(fn ($validatorInstance) => $this->validateBusinessRules($validatorInstance));
    }

    private function validateBusinessRules(\Illuminate\Validation\Validator $validator): void
    {
        $locationId = $this->input('location_id');
        $customerId = $this->input('customer_id');
        $targetLocationId = $this->input('target_location_id');
        $sourceLocation = Location::with('type')->find($locationId);

        $this->validateLocationHierarchy($validator, $sourceLocation, $customerId, $targetLocationId);
        $this->validateTargetDisjoint($validator, $locationId, $customerId, $targetLocationId);
    }

    private function validateLocationHierarchy(\Illuminate\Validation\Validator $validator, ?\App\Models\Location $source, ?int $customerId, ?int $targetId): void
    {
        if (! $source || ! $source->type) {
            return;
        }
        if ($source->type->code === Location::CODE_WAREHOUSE) {
            if ($customerId) {
                $validator->errors()->add('customer_id', __('validation.warehouse_cannot_serve_individual'));
            }
            if (! $targetId) {
                $validator->errors()->add('target_location_id', __('validation.warehouse_must_select_target_branch'));
            }
        }
        if ($source->type->code === Location::CODE_BRANCH && $targetId) {
            $validator->errors()->add('target_location_id', __('validation.branch_cannot_sell_to_branch'));
        }
    }

    private function validateTargetDisjoint(\Illuminate\Validation\Validator $validator, int $sourceId, ?int $customerId, ?int $targetId): void
    {
        if ($customerId && $targetId) {
            $validator->errors()->add('customer_id', __('validation.select_customer_or_target_branch'));
        }
        if ($targetId && $targetId == $sourceId) {
            $validator->errors()->add('target_location_id', __('validation.source_same_as_destination'));
        }
    }
}

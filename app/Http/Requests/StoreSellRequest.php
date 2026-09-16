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
            'is_internal' => ['sometimes', 'boolean'],
            'buyer_tab' => ['sometimes', 'string', 'in:general,customer,branch'],
            'idempotency_key' => ['sometimes', 'nullable', 'string', 'max:64'],
            'sales_channel_id' => ['nullable', 'integer', new ExistsInGroup('types', Type::GROUP_SALES_CHANNEL)],
            'transaction_date' => ['required', 'date'],
            'payment_method_type_id' => ['nullable', 'integer', new ExistsInGroup('types', Type::GROUP_PAYMENT)],
            'installment_terms' => ['required', 'integer', 'in:1,2,3'],
            'interest_rate' => ['sometimes', 'numeric', 'min:0', 'max:100'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id,deleted_at,NULL'],
            'items.*.sell_price' => ['required', 'numeric', 'min:0'],
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
        $locationId = (int) $this->input('location_id');
        $customerId = $this->input('customer_id') ? (int) $this->input('customer_id') : null;
        $targetLocationId = $this->input('target_location_id') ? (int) $this->input('target_location_id') : null;
        $sourceLocation = Location::with('type')->find($locationId);

        $this->validateLocationHierarchy($validator, $sourceLocation, $customerId, $targetLocationId);
        $this->validateTargetDisjoint($validator, $locationId, $customerId, $targetLocationId);
        $this->validateInternalDestination($validator, $targetLocationId);
        $this->validateCustomerSelection($validator, $customerId);
    }

    private function validateCustomerSelection(\Illuminate\Validation\Validator $validator, ?int $customerId): void
    {
        if ($this->input('buyer_tab') === 'customer' && ! $customerId) {
            $validator->errors()->add('customer_id', __('validation.customer_required_for_customer_tab'));
        }
    }

    private function validateInternalDestination(\Illuminate\Validation\Validator $validator, ?int $targetId): void
    {
        if ($this->boolean('is_internal') && ! $targetId) {
            $validator->errors()->add('target_location_id', __('validation.internal_must_select_target_location'));
        }
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

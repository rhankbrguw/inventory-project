<?php

namespace App\Rules;

use App\Models\Role;
use App\Models\Type;
use Closure;
use Illuminate\Contracts\Validation\DataAwareRule;
use Illuminate\Contracts\Validation\ValidationRule;
use Spatie\Permission\Models\Role as SpatieRole;

class ValidRoleForLocationType implements DataAwareRule, ValidationRule
{
    protected array $validationPayload = [];

    public function setData(array $payload): static
    {
        $this->validationPayload = $payload;

        return $this;
    }

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $locationType = Type::find($this->validationPayload['type_id'] ?? null);
        $role = SpatieRole::find($value);

        if (! $locationType || ! $role) {
            return;
        }

        // Use named constants — no magic numbers
        $isStorageNode = $locationType->level === Type::LEVEL_STORAGE;
        $isSalesNode = $locationType->level === Type::LEVEL_SALES;

        if ($isStorageNode && $role->code === Role::CODE_BRANCH_MGR) {
            $fail(__('validation.role_invalid_for_storage_location'));
        }

        if ($isSalesNode && $role->code === Role::CODE_WAREHOUSE_MGR) {
            $fail(__('validation.role_invalid_for_sales_location'));
        }
    }
}

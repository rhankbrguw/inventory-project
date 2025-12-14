<?php

namespace App\Rules;

use App\Models\Type;
use Illuminate\Contracts\Validation\DataAwareRule;
use Illuminate\Contracts\Validation\ValidationRule;
use Spatie\Permission\Models\Role;
use Closure;

class ValidRoleForLocationType implements ValidationRule, DataAwareRule
{
    protected $data = [];

    public function setData(array $data): static
    {
        $this->data = $data;
        return $this;
    }

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $locationType = Type::find($this->data['type_id'] ?? null);
        $role = Role::find($value);

        if (!$locationType || !$role) {
            return;
        }

        $isStorageNode = $locationType->level === 1;
        $isSalesNode   = $locationType->level === 2;

        if ($isStorageNode && $role->name === 'Branch Manager') {
            $fail('Peran Branch Manager tidak valid untuk tipe lokasi Penyimpanan.');
        }

        if ($isSalesNode && $role->name === 'Warehouse Manager') {
            $fail('Peran Warehouse Manager tidak valid untuk tipe lokasi Penjualan.');
        }
    }
}

<?php

namespace App\Rules;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Support\Facades\DB;
use Closure;

class ExistsInGroup implements ValidationRule
{
    private string $table;
    private string $group;
    private string $groupColumn;
    private string $idColumn = 'id';

    public function __construct(string $table, string $group, string $groupColumn = 'group')
    {
        $this->table = $table;
        $this->group = $group;
        $this->groupColumn = $groupColumn;
    }

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $exists = DB::table($this->table)
            ->where($this->idColumn, $value)
            ->where($this->groupColumn, $this->group)
            ->exists();

        if (!$exists) {
            $fail(':attribute yang dipilih tidak valid.');
        }
    }
}

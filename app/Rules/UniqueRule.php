<?php

namespace App\Rules;

use Illuminate\Contracts\Validation\Rule;
use Illuminate\Support\Facades\DB;
use App\Rules\ValidPhoneNumber;

class UniqueRule implements Rule
{
    private string $table;
    private ?string $column;
    private $ignoreId;
    private string $ignoreColumn = 'id';
    private array $wheres = [];

    public function __construct(string $table, $ignoreId = null, string $column = null)
    {
        $this->table = $table;
        $this->ignoreId = $ignoreId;
        $this->column = $column;
    }

    public function passes($attribute, $value)
    {
        $formattedValue = ValidPhoneNumber::format($value);

        $column = $this->column ?? $attribute;

        $query = DB::table($this->table)->where($column, $formattedValue);

        if ($this->ignoreId !== null) {
            $query->where($this->ignoreColumn, '!=', $this->ignoreId);
        }

        foreach ($this->wheres as $where) {
            $query->where($where[0], $where[1]);
        }

        return $query->doesntExist();
    }

    public function message()
    {
        return ':attribute ini sudah terdaftar.';
    }

    public function where(string $column, $value): self
    {
        $this->wheres[] = [$column, $value];

        return $this;
    }
}

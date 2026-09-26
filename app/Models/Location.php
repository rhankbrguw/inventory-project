<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Location extends Model
{
    use HasFactory;
    use SoftDeletes;

    public const CODE_BRANCH = 'BR';

    public const CODE_WAREHOUSE = 'WH';

    protected $fillable = [
        'name',
        'type_id',
        'manager_id',
        'address',
    ];

    protected static function booted(): void
    {
        static::saved(fn () => \Illuminate\Support\Facades\Cache::forget('locations_dropdown_super'));
        static::deleted(fn () => \Illuminate\Support\Facades\Cache::forget('locations_dropdown_super'));
    }

    public static function getForDropdown(): \Illuminate\Support\Collection
    {
        return \Illuminate\Support\Facades\Cache::remember('locations_dropdown_super', 3600, fn () => static::select('id', 'name')->orderBy('name')->get());
    }

    public function type(): BelongsTo
    {
        return $this->belongsTo(Type::class);
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class)->withPivot('role_id')->withTimestamps();
    }

    public function inventories(): HasMany
    {
        return $this->hasMany(Inventory::class);
    }

    public function stockMovements(): HasMany
    {
        return $this->hasMany(StockMovement::class);
    }

    public function isBranch(): bool
    {
        return $this->type && $this->type->code === self::CODE_BRANCH;
    }

    public function isWarehouse(): bool
    {
        return $this->type && $this->type->code === self::CODE_WAREHOUSE;
    }
}

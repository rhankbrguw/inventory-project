<?php

namespace App\Models;

use App\Traits\ScopedByLocation;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, ScopedByLocation, SoftDeletes;

    public const CLASSIFICATION_FAST = 'FAST MOVING';

    public const CLASSIFICATION_SLOW = 'SLOW MOVING';

    public const CLASSIFICATION_DEAD = 'DEAD STOCK';

    public const CLASSIFICATION_FAST_THRESHOLD = 50;

    public const CLASSIFICATION_SLOW_THRESHOLD = 10;

    public const CLASSIFICATION_DAYS = 30;

    public const VALID_UNITS = ['kg', 'ons', 'pcs', 'ekor', 'pack', 'box', 'liter', 'gram'];

    protected $fillable = [
        'location_id', 'type_id', 'default_supplier_id',
        'name', 'sku', 'description', 'price', 'unit',
        'image_path', 'average_cost',
    ];

    protected static function booted(): void
    {
        static::saved(fn () => \Illuminate\Support\Facades\Cache::forget('all_products_dropdown'));
        static::deleted(fn () => \Illuminate\Support\Facades\Cache::forget('all_products_dropdown'));
    }

    public function type(): BelongsTo
    {
        return $this->belongsTo(Type::class);
    }

    public function defaultSupplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class, 'default_supplier_id');
    }

    public function suppliers(): BelongsToMany
    {
        return $this->belongsToMany(Supplier::class, 'product_supplier');
    }

    public function inventories(): HasMany
    {
        return $this->hasMany(Inventory::class);
    }

    public function prices(): HasMany
    {
        return $this->hasMany(ProductPrice::class);
    }

    public function stockMovements(): HasMany
    {
        return $this->hasMany(StockMovement::class);
    }

    public function scopeAccessibleBy(\Illuminate\Database\Eloquent\Builder $query, mixed $userOrIds): \Illuminate\Database\Eloquent\Builder
    {
        if ($userOrIds instanceof User) {
            if ($userOrIds->level === Role::LEVEL_SUPER_ADMIN) {
                return $query;
            }
            $locationIds = $userOrIds->getAccessibleLocationIds();
        } else {
            $locationIds = $userOrIds;
        }

        if ($locationIds === null) {
            return $query;
        }

        return $query->where(function ($q) use ($locationIds) {
            $q->whereNull('location_id')
                ->orWhereIn('location_id', $locationIds)
                ->orWhereHas('inventories', fn ($iq) => $iq->whereIn('location_id', $locationIds));
        });
    }

    public function getEffectivePriceAttribute(): float
    {
        if ($this->relationLoaded('inventories')) {
            $inv = $this->inventories->first();
            if ($inv && $inv->selling_price !== null && $inv->selling_price > 0) {
                return (float) $inv->selling_price;
            }
        }

        return (float) $this->price;
    }

    public function getEffectivePrice(?int $locationId): float
    {
        if (! $locationId) {
            return (float) $this->price;
        }
        $inventory = $this->inventories->where('location_id', $locationId)->first();
        if ($inventory && $inventory->selling_price !== null && $inventory->selling_price > 0) {
            return (float) $inventory->selling_price;
        }

        return (float) $this->price;
    }

    public function scopeWithClassification(\Illuminate\Database\Eloquent\Builder $query): \Illuminate\Database\Eloquent\Builder
    {
        $subquery = \App\Models\StockMovement::selectRaw('ABS(COALESCE(SUM(quantity), 0))')
            ->whereColumn('stock_movements.product_id', 'products.id')
            ->where('stock_movements.type', 'sell')
            ->where('stock_movements.created_at', '>=', now()->subDays(self::CLASSIFICATION_DAYS));

        if (! $query->getQuery()->columns) {
            $query->select('products.*');
        }

        return $query->selectSub($subquery, 'total_sold_30_days');
    }

    public function getClassificationAttribute(): string
    {
        $totalSold = array_key_exists('total_sold_30_days', $this->attributes)
            ? (float) $this->attributes['total_sold_30_days']
            : abs($this->stockMovements()->where('type', StockMovement::TYPE_SELL)->where('created_at', '>=', now()->subDays(self::CLASSIFICATION_DAYS))->sum('quantity'));

        return match (true) {
            $totalSold >= self::CLASSIFICATION_FAST_THRESHOLD => __('ui.fast_moving'),
            $totalSold >= self::CLASSIFICATION_SLOW_THRESHOLD => __('ui.slow_moving'),
            default => __('ui.dead_stock'),
        };
    }
}

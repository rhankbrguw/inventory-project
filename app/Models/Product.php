<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory;
    use SoftDeletes;
    use \App\Traits\ScopedByLocation;

    protected $fillable = [
        'location_id',
        'type_id',
        'default_supplier_id',
        'name',
        'sku',
        'description',
        'price',
        'unit',
        'image_path',
        'average_cost',
    ];

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

    public function getEffectivePrice(?int $locationId): float
    {
        if (!$locationId) {
            return (float) $this->price;
        }
        $inventory = $this->inventories->where('location_id', $locationId)->first();
        if ($inventory && $inventory->selling_price !== null && $inventory->selling_price > 0) {
            return (float) $inventory->selling_price;
        }
        return (float) $this->price;
    }
}

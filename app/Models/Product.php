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

    protected $fillable = [
        "type_id",
        "default_supplier_id",
        "name",
        "sku",
        "description",
        "price",
        "unit",
        "image_path",
    ];

    public function type(): BelongsTo
    {
        return $this->belongsTo(Type::class);
    }

    public function defaultSupplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class, "default_supplier_id");
    }

    public function suppliers(): BelongsToMany
    {
        return $this->belongsToMany(Supplier::class, "product_supplier");
    }

    public function inventories(): HasMany
    {
        return $this->hasMany(Inventory::class);
    }

    public function cartItems(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }
}

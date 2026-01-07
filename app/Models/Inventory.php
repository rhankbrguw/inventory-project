<?php

namespace App\Models;

use App\Traits\ScopedByLocation;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

class Inventory extends Model
{
    use HasFactory;
    use ScopedByLocation;

    protected $fillable = [
        'location_id',
        'product_id',
        'quantity',
        'average_cost',
        'selling_price',
        'local_supplier_id',
        'low_stock_threshold',
        'bin_location',
    ];

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function localSupplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class, 'local_supplier_id');
    }
}

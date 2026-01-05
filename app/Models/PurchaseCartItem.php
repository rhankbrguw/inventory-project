<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PurchaseCartItem extends Model
{
    use HasFactory;

    protected $table = 'purchase_cart_items';

    protected $fillable = [
        'user_id',
        'product_id',
        'supplier_id',
        'quantity',
        'cost_per_unit',
    ];

    protected $casts = [
        'quantity' => 'decimal:4',
        'cost_per_unit' => 'decimal:2',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }
}

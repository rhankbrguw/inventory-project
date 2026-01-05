<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SellCartItem extends Model
{
    use HasFactory;

    protected $table = 'sell_cart_items';

    protected $fillable = [
        'user_id',
        'location_id',
        'product_id',
        'sales_channel_type_id',
        'quantity',
        'sell_price',
    ];

    protected $casts = [
        'quantity' => 'decimal:4',
        'sell_price' => 'decimal:2',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function salesChannel()
    {
        return $this->belongsTo(Type::class, 'sales_channel_type_id');
    }
}

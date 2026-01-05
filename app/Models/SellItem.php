<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SellItem extends Model
{
    protected $fillable = [
        'sell_id',
        'product_id',
        'sales_channel_type_id',
        'quantity',
        'sell_price',
        'cost_per_unit',
    ];

    public function sell()
    {
        return $this->belongsTo(Sell::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class)->withTrashed();
    }

    public function salesChannel()
    {
        return $this->belongsTo(Type::class, 'sales_channel_type_id');
    }
}

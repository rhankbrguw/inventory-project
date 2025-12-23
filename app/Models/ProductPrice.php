<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductPrice extends Model
{
    protected $fillable = ['product_id', 'sales_channel_id', 'price'];

    public function channel()
    {
        return $this->belongsTo(SalesChannel::class, 'sales_channel_id');
    }
}

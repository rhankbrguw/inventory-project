<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductPrice extends Model
{
    protected $fillable = ['product_id', 'type_id', 'price'];

    public function type()
    {
        return $this->belongsTo(Type::class, 'type_id');
    }
}

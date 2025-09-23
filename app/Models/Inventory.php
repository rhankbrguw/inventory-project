<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Inventory extends Model
{
   use HasFactory;

   protected $fillable = [
      'location_id',
      'product_id',
      'quantity',
      'average_cost',
   ];

   public function location()
   {
      return $this->belongsTo(Location::class);
   }

   public function product()
   {
      return $this->belongsTo(Product::class);
   }
}

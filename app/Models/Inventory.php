<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Inventory extends Model
{
   use HasFactory;

   protected $fillable = [
      'location_id',
      'product_id',
      'quantity',
      'average_cost',
   ];

   public function location(): BelongsTo
   {
      return $this->belongsTo(Location::class);
   }

   public function product(): BelongsTo
   {
      return $this->belongsTo(Product::class);
   }
}

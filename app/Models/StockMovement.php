<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StockMovement extends Model
{
   use HasFactory;

   protected $fillable = [
      'inventory_id',
      'quantity_change',
      'type',
      'source_id',
      'source_type',
      'notes',
   ];

   public function source()
   {
      return $this->morphTo();
   }
}

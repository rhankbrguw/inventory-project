<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockMovement extends Model
{
   use HasFactory;

   protected $fillable = [
      'product_id',
      'supplier_id',
      'location_id',
      'purchase_id',
      'type',
      'quantity',
      'cost_per_unit',
      'notes',
   ];

   public function product(): BelongsTo
   {
      return $this->belongsTo(Product::class);
   }

   public function supplier(): BelongsTo
   {
      return $this->belongsTo(Supplier::class);
   }

   public function location(): BelongsTo
   {
      return $this->belongsTo(Location::class);
   }

   public function purchase(): BelongsTo
   {
      return $this->belongsTo(Purchase::class);
   }
}

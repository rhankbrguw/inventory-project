<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Purchase extends Model
{
   use HasFactory;

   protected $guarded = [];

   public function location(): BelongsTo
   {
      return $this->belongsTo(Location::class);
   }

   public function supplier(): BelongsTo
   {
      return $this->belongsTo(Supplier::class);
   }

   public function user(): BelongsTo
   {
      return $this->belongsTo(User::class);
   }

   public function stockMovements(): HasMany
   {
      return $this->hasMany(StockMovement::class);
   }
}

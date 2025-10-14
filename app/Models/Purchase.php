<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Purchase extends Model
{
   use HasFactory;

   protected $fillable = [
      'location_id',
      'supplier_id',
      'user_id',
      'reference_code',
      'transaction_date',
      'total_cost',
      'status',
      'notes',
      'payment_method_type_id',
   ];

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

   public function paymentMethodType(): BelongsTo
   {
      return $this->belongsTo(Type::class, 'payment_method_type_id');
   }

   public function stockMovements(): HasMany
   {
      return $this->hasMany(StockMovement::class);
   }
}

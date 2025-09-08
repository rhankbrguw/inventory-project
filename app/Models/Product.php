<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
   use HasFactory, SoftDeletes;

   protected $fillable = [
      'name',
      'sku',
      'description',
      'price',
      'unit',
   ];

   protected $casts = [
      'price' => 'decimal:2',
   ];

   public function locations(): BelongsToMany
   {
      return $this->belongsToMany(Location::class, 'location_product');
   }
}

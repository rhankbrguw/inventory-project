<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Location extends Model
{
   use HasFactory;

   protected $fillable = [
      'name',
      'type',
      'address',
   ];

   public function inventories()
   {
      return $this->hasMany(Inventory::class);
   }

   public function products(): BelongsToMany
   {
      return $this->belongsToMany(Product::class, 'location_product');
   }
}

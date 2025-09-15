<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
   use HasFactory, SoftDeletes;

   protected $fillable = [
      'type_id',
      'default_supplier_id',
      'name',
      'sku',
      'description',
      'price',
      'unit',
      'image_path',
   ];

   public function type()
   {
      return $this->belongsTo(Type::class);
   }

   public function defaultSupplier()
   {
      return $this->belongsTo(Supplier::class, 'default_supplier_id');
   }

   public function suppliers()
   {
      return $this->belongsToMany(Supplier::class, 'product_supplier');
   }

   public function inventories()
   {
      return $this->hasMany(Inventory::class);
   }
}

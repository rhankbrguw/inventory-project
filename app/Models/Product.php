<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
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
    'stock_quantity',
    'low_stock_threshold',
  ];

  protected $casts = [
    'price' => 'decimal:2',
    'stock_quantity' => 'integer',
    'low_stock_threshold' => 'integer',
  ];
}

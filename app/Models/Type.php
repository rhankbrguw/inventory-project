<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Type extends Model
{
   use HasFactory;

   protected $fillable = ['name', 'group', 'code'];

   public const GROUP_PRODUCT = 'product_type';
   public const GROUP_USER_ROLE = 'user_role';
   public const GROUP_PAYMENT = 'payment_method';

   public static function getAvailableGroups(): array
   {
      return [
         self::GROUP_PRODUCT => 'Tipe Produk',
         self::GROUP_USER_ROLE => 'Role Pengguna',
         self::GROUP_PAYMENT => 'Metode Pembayaran',
      ];
   }

   public function products()
   {
      return $this->hasMany(Product::class);
   }
}

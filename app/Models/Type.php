<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Type extends Model
{
   use HasFactory, SoftDeletes;

   protected $fillable = ['name', 'group', 'code'];

   public const GROUP_PRODUCT = 'product_type';
   public const GROUP_USER_ROLE = 'user_role';
   public const GROUP_LOCATION = 'location_type';
   public const GROUP_TRANSACTION = 'transaction_type';
   public const GROUP_PAYMENT = 'payment_method';

   public static function getAvailableGroups(): array
   {
      return [
         self::GROUP_PRODUCT => [
            'label' => 'Tipe Produk',
            'description' => 'Digunakan untuk mengkategorikan produk.',
         ],
         self::GROUP_USER_ROLE => [
            'label' => 'Role Pengguna',
            'description' => 'Digunakan untuk menentukan role/jabatan pengguna.',
         ],
         self::GROUP_LOCATION => [
            'label' => 'Tipe Lokasi',
            'description' => 'Digunakan untuk mengkategorikan lokasi.',
         ],
         self::GROUP_TRANSACTION => [
            'label' => 'Tipe Transaksi',
            'description' => 'Kategori untuk jenis transaksi.',
         ],
         self::GROUP_PAYMENT => [
            'label' => 'Metode Pembayaran',
            'description' => 'Digunakan untuk jenis pembayaran pada transaksi.',
         ],
      ];
   }

   public function products(): HasMany
   {
      return $this->hasMany(Product::class);
   }
}

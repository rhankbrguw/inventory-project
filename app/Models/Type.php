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

   public static function getAvailableGroups(): array
   {
      return [
         self::GROUP_PRODUCT => [
            'label' => 'Tipe Produk',
            'description' => 'Digunakan untuk mengkategorikan produk. Akan muncul di form Tambah/Edit Produk.',
         ],
         self::GROUP_USER_ROLE => [
            'label' => 'Role Pengguna',
            'description' => 'Digunakan untuk menentukan role/jabatan pengguna (Contoh: Kasir, Manajer Gudang).',
         ],
         self::GROUP_LOCATION => [
            'label' => 'Tipe Lokasi',
            'description' => 'Digunakan untuk mengkategorikan lokasi (Contoh: Gudang Pusat, Toko, Kios).',
         ],
         self::GROUP_TRANSACTION => [
            'label' => 'Tipe Transaksi',
            'description' => 'Kategori untuk jenis transaksi (Contoh: Pembelian, Penjualan, Retur).',
         ],
      ];
   }

   public function products(): HasMany
   {
      return $this->hasMany(Product::class);
   }
}

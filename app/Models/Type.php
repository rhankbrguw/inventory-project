<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Type extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $fillable = ['name', 'group', 'code', 'level'];

    public const GROUP_PRODUCT = 'product_type';
    public const GROUP_SALES_CHANNEL = 'sales_channel';
    public const GROUP_USER_ROLE = 'user_role';
    public const GROUP_LOCATION = 'location_type';
    public const GROUP_TRANSACTION = 'transaction_type';
    public const GROUP_PAYMENT = 'payment_method';
    public const GROUP_CUSTOMER = 'customer_type';

    public static function getAvailableGroups(): array
    {
        return [
            self::GROUP_PRODUCT => [
                'label' => 'Tipe Produk',
                'description' => 'Digunakan untuk mengkategorikan produk.',
            ],
            self::GROUP_SALES_CHANNEL => [
                'label' => 'Channel Penjualan',
                'description' => 'Platform penjualan (GoFood, Grab, dll).',
            ],
            self::GROUP_USER_ROLE => [
                'label' => 'Role Pengguna',
                'description' => 'Digunakan untuk menentukan role/jabatan pengguna. Membutuhkan Level Akses.',
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
            self::GROUP_CUSTOMER => [
                'label' => 'Tipe Pelanggan',
                'description' => 'Digunakan untuk mengkategorikan pelanggan.',
            ],
        ];
    }

    public static function getAvailableLevels(): array
    {
        return [
            self::GROUP_USER_ROLE => [
                ['value' => 1, 'label' => 'Level 1 - Super Admin / Owner (Full Access)'],
                ['value' => 10, 'label' => 'Level 10 - Managerial (Purchase & Transfer)'],
                ['value' => 20, 'label' => 'Level 20 - Operational (Sales & Inventory)'],
            ],
            self::GROUP_LOCATION => [
                ['value' => 1, 'label' => 'Penyimpanan (Gudang/Pusat) - Bisa Purchase'],
                ['value' => 2, 'label' => 'Penjualan (Cabang/Outlet) - Bisa Sell/POS'],
            ],
        ];
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    public function customers(): HasMany
    {
        return $this->hasMany(Customer::class, 'type_id');
    }
}

<?php

namespace Database\Seeders;

use App\Models\Type;
use Illuminate\Database\Seeder;

class TypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            ['group' => Type::GROUP_PRODUCT, 'name' => 'Bahan Baku', 'code' => 'BB', 'level' => null],
            ['group' => Type::GROUP_PRODUCT, 'name' => 'Menu Jadi', 'code' => 'MJ', 'level' => null],
            ['group' => Type::GROUP_PRODUCT, 'name' => 'Setengah Jadi', 'code' => 'SJ', 'level' => null],

            ['group' => Type::GROUP_USER_ROLE, 'name' => 'Super Admin', 'code' => 'ADM', 'level' => 1],
            ['group' => Type::GROUP_USER_ROLE, 'name' => 'Warehouse Manager', 'code' => 'WHM', 'level' => 10],
            ['group' => Type::GROUP_USER_ROLE, 'name' => 'Branch Manager', 'code' => 'BRM', 'level' => 10],
            ['group' => Type::GROUP_USER_ROLE, 'name' => 'Cashier', 'code' => 'CSH', 'level' => 20],
            ['group' => Type::GROUP_USER_ROLE, 'name' => 'Staff', 'code' => 'STF', 'level' => 20],

            ['group' => Type::GROUP_LOCATION, 'name' => 'Warehouse', 'code' => 'WH', 'level' => null],
            ['group' => Type::GROUP_LOCATION, 'name' => 'Branch', 'code' => 'BR', 'level' => null],

            ['group' => Type::GROUP_CUSTOMER, 'name' => 'Individu', 'code' => 'IND', 'level' => null],
            ['group' => Type::GROUP_CUSTOMER, 'name' => 'Cabang', 'code' => 'CBG', 'level' => null],
            ['group' => Type::GROUP_CUSTOMER, 'name' => 'Mitra', 'code' => 'MTR', 'level' => null],
            ['group' => Type::GROUP_CUSTOMER, 'name' => 'Organisasi', 'code' => 'OGN', 'level' => null],

            ['group' => Type::GROUP_TRANSACTION, 'name' => 'Pembelian', 'code' => 'PB', 'level' => null],
            ['group' => Type::GROUP_TRANSACTION, 'name' => 'Penjualan', 'code' => 'PJ', 'level' => null],
            ['group' => Type::GROUP_TRANSACTION, 'name' => 'Penyesuaian', 'code' => 'PY', 'level' => null],

            ['group' => Type::GROUP_PAYMENT, 'name' => 'Tunai', 'code' => 'TUN', 'level' => null],
            ['group' => Type::GROUP_PAYMENT, 'name' => 'Transfer Bank', 'code' => 'TRF', 'level' => null],
            ['group' => Type::GROUP_PAYMENT, 'name' => 'QRIS', 'code' => 'QR', 'level' => null],
        ];

        foreach ($types as $type) {
            Type::updateOrCreate(
                ['group' => $type['group'], 'code' => $type['code']],
                $type
            );
        }
    }
}

<?php

namespace Database\Seeders;

use App\Models\Type;
use Illuminate\Database\Seeder;

class TypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            ['group' => Type::GROUP_PRODUCT, 'name' => 'Bahan Baku', 'code' => 'BB'],
            ['group' => Type::GROUP_PRODUCT, 'name' => 'Menu Jadi', 'code' => 'MJ'],
            ['group' => Type::GROUP_PRODUCT, 'name' => 'Setengah Jadi', 'code' => 'SJ'],
            ['group' => Type::GROUP_USER_ROLE, 'name' => 'Super Admin', 'code' => 'ADM'],
            ['group' => Type::GROUP_USER_ROLE, 'name' => 'Warehouse Manager', 'code' => 'WHM'],
            ['group' => Type::GROUP_USER_ROLE, 'name' => 'Branch Manager', 'code' => 'BRM'],
            ['group' => Type::GROUP_USER_ROLE, 'name' => 'Cashier', 'code' => 'CSH'],
            ['group' => Type::GROUP_USER_ROLE, 'name' => 'Staff', 'code' => 'STF'],
            ['group' => Type::GROUP_LOCATION, 'name' => 'Warehouse', 'code' => 'WH'],
            ['group' => Type::GROUP_LOCATION, 'name' => 'Branch', 'code' => 'BR'],
            ['group' => Type::GROUP_CUSTOMER, 'name' => 'Individu', 'code' => 'IND'],
            ['group' => Type::GROUP_CUSTOMER, 'name' => 'Cabang', 'code' => 'CBG'],
            ['group' => Type::GROUP_CUSTOMER, 'name' => 'Mitra', 'code' => 'MTR'],
            ['group' => Type::GROUP_CUSTOMER, 'name' => 'Organisasi', 'code' => 'OGN'],
            ['group' => Type::GROUP_TRANSACTION, 'name' => 'Pembelian', 'code' => 'PB'],
            ['group' => Type::GROUP_TRANSACTION, 'name' => 'Penjualan', 'code' => 'PJ'],
            ['group' => Type::GROUP_TRANSACTION, 'name' => 'Penyesuaian', 'code' => 'PY'],
            ['group' => Type::GROUP_PAYMENT, 'name' => 'Tunai', 'code' => 'TUN'],
            ['group' => Type::GROUP_PAYMENT, 'name' => 'Transfer Bank', 'code' => 'TRF'],
            ['group' => Type::GROUP_PAYMENT, 'name' => 'QRIS', 'code' => 'QR'],
        ];

        foreach ($types as $type) {
            Type::updateOrCreate(
                ['group' => $type['group'], 'name' => $type['name']],
                $type
            );
        }
    }
}

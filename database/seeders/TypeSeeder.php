<?php

namespace Database\Seeders;

use App\Models\Type;
use App\Models\Role;
use Illuminate\Database\Seeder;

class TypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            ['group' => Type::GROUP_PRODUCT, 'name' => 'Bahan Baku', 'code' => 'BB', 'level' => null],
            ['group' => Type::GROUP_PRODUCT, 'name' => 'Menu Jadi', 'code' => 'MJ', 'level' => null],
            ['group' => Type::GROUP_PRODUCT, 'name' => 'Setengah Jadi', 'code' => 'SJ', 'level' => null],

            ['group' => Type::GROUP_SALES_CHANNEL, 'name' => 'Cash / Counter', 'code' => 'CASH', 'level' => null],
            ['group' => Type::GROUP_SALES_CHANNEL, 'name' => 'GoFood', 'code' => 'GFD', 'level' => null],
            ['group' => Type::GROUP_SALES_CHANNEL, 'name' => 'GrabFood', 'code' => 'GRB', 'level' => null],
            ['group' => Type::GROUP_SALES_CHANNEL, 'name' => 'ShopeeFood', 'code' => 'SPF', 'level' => null],

            ['group' => Type::GROUP_USER_ROLE, 'name' => 'Super Admin', 'code' => Role::CODE_SUPER_ADMIN, 'level' => Role::LEVEL_SUPER_ADMIN],
            ['group' => Type::GROUP_USER_ROLE, 'name' => 'Warehouse Manager', 'code' => Role::CODE_WAREHOUSE_MGR, 'level' => Role::THRESHOLD_MANAGERIAL],
            ['group' => Type::GROUP_USER_ROLE, 'name' => 'Branch Manager', 'code' => Role::CODE_BRANCH_MGR, 'level' => Role::THRESHOLD_MANAGERIAL],
            ['group' => Type::GROUP_USER_ROLE, 'name' => 'Cashier', 'code' => 'CSH', 'level' => Role::THRESHOLD_STAFF],
            ['group' => Type::GROUP_USER_ROLE, 'name' => 'Staff', 'code' => 'STF', 'level' => Role::THRESHOLD_STAFF],

            ['group' => Type::GROUP_LOCATION, 'name' => 'Warehouse', 'code' => 'WH', 'level' => 1],
            ['group' => Type::GROUP_LOCATION, 'name' => 'Branch', 'code' => 'BR', 'level' => 2],

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

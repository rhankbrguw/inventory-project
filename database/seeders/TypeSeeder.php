<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Type;

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

            ['group' => Type::GROUP_CUSTOMER, 'name' => 'Individu'],
            ['group' => Type::GROUP_CUSTOMER, 'name' => 'Cabang'],
            ['group' => Type::GROUP_CUSTOMER, 'name' => 'Mitra'],
        ];

        foreach ($types as $type) {
            Type::updateOrCreate(
                ['group' => $type['group'], 'name' => $type['name']],
                $type
            );
        }
    }
}

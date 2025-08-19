<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        Role::create(['name' => 'Super Admin']);
        Role::create(['name' => 'Finance']);
        Role::create(['name' => 'Branch Manager']);
        Role::create(['name' => 'Cashier']);
    }
}

<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        Role::firstOrCreate(['name' => 'Super Admin']);
        Role::firstOrCreate(['name' => 'Warehouse Manager']);
        Role::firstOrCreate(['name' => 'Branch Manager']);
        Role::firstOrCreate(['name' => 'Cashier']);
    }
}

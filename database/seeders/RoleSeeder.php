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

      Role::updateOrCreate(['name' => 'Super Admin', 'guard_name' => 'web'], ['code' => 'ADM']);
      Role::updateOrCreate(['name' => 'Warehouse Manager', 'guard_name' => 'web'], ['code' => 'WHM']);
      Role::updateOrCreate(['name' => 'Branch Manager', 'guard_name' => 'web'], ['code' => 'BRM']);
      Role::updateOrCreate(['name' => 'Cashier', 'guard_name' => 'web'], ['code' => 'CSH']);
   }
}

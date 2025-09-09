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

      Role::updateOrCreate(['name' => 'Super Admin'], ['code' => 'ADM']);
      Role::updateOrCreate(['name' => 'Warehouse Manager'], ['code' => 'WHM']);
      Role::updateOrCreate(['name' => 'Branch Manager'], ['code' => 'BRM']);
      Role::updateOrCreate(['name' => 'Cashier'], ['code' => 'CSH']);
   }
}

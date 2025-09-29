<?php

namespace Database\Seeders;

use App\Models\Type;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RoleSeeder extends Seeder
{
   public function run(): void
   {
      app()[PermissionRegistrar::class]->forgetCachedPermissions();

      $roles = [
         ['name' => 'Super Admin', 'code' => 'ADM'],
         ['name' => 'Warehouse Manager', 'code' => 'WHM'],
         ['name' => 'Branch Manager', 'code' => 'BRM'],
         ['name' => 'Cashier', 'code' => 'CSH'],
         ['name' => 'Finance', 'code' => 'FN'],
      ];

      foreach ($roles as $role) {
         Role::updateOrCreate(
            ['name' => $role['name'], 'guard_name' => 'web'],
            ['code' => $role['code']]
         );

         Type::updateOrCreate(
            ['group' => Type::GROUP_USER_ROLE, 'name' => $role['name']],
            ['code' => $role['code']]
         );
      }
   }
}

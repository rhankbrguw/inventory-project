<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use App\Models\Type;

class RoleToTypeSeeder extends Seeder
{
   public function run(): void
   {
      $roles = Role::all();

      foreach ($roles as $role) {
         Type::updateOrCreate(
            [
               'group' => 'user_role',
               'name' => $role->name,
            ],
            [
               'code' => $role->code,
            ]
         );
      }
   }
}

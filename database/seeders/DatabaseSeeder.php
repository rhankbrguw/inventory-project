<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
   public function run(): void
   {
      $this->call([
         RoleSeeder::class,
         LocationSeeder::class,
         TypeSeeder::class,
      ]);

      $superAdmin = User::firstOrCreate(
         ['email' => env('ADMIN_EMAIL', 'admin@example.com')],
         [
            'name' => env('ADMIN_NAME', 'Super Admin'),
            'password' => Hash::make(env('ADMIN_PASSWORD', 'password')),
         ]
      );

      $superAdmin->assignRole('Super Admin');
   }
}

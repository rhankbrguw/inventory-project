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
        ]);

        $superAdmin = User::firstOrCreate(
            ['email' => env('ADMIN_EMAIL', 'raihanakbarg28@gmail.com')],
            [
                'name' => env('ADMIN_NAME', 'Raihan Akbar Gunawan'),
                'password' => Hash::make(env('ADMIN_PASSWORD', 'Raihan123')),
            ]
        );

        $superAdmin->assignRole('Super Admin');
    }
}

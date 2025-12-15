<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            TypeSeeder::class,
            RoleSeeder::class,
            LocationSeeder::class,
        ]);

        $this->command->info('✅ Base data seeded successfully!');
        $this->command->info('🚀 Access /setup to create your Super Admin account');
    }
}

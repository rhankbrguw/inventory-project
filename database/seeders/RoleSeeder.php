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

        $rolesFromTypes = Type::where('group', Type::GROUP_USER_ROLE)->get();

        foreach ($rolesFromTypes as $type) {
            Role::updateOrCreate(
                ['name' => $type->name, 'guard_name' => 'web'],
                [
                    'code' => $type->code,
                    'level' => $type->level ?? 100
                ]
            );
        }
    }
}

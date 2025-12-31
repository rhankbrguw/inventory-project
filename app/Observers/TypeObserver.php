<?php

namespace App\Observers;

use App\Models\Role;
use App\Models\Type;
use Spatie\Permission\PermissionRegistrar;

class TypeObserver
{
    private function clearRoleCache(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();
    }

    public function created(Type $type): void
    {
        if ($type->group === Type::GROUP_USER_ROLE) {
            $level = $type->level ?? Role::THRESHOLD_STAFF;

            Role::create([
                'name' => $type->name,
                'code' => $type->code,
                'level' => $level,
                'guard_name' => 'web'
            ]);
            $this->clearRoleCache();
        }
    }

    public function updated(Type $type): void
    {
        if (
            $type->group === Type::GROUP_USER_ROLE &&
            ($type->isDirty('name') || $type->isDirty('code') || $type->isDirty('level'))
        ) {

            $searchName = $type->isDirty('name') ? $type->getOriginal('name') : $type->name;

            $role = Role::where('name', $searchName)->where('guard_name', 'web')->first();

            if ($role) {
                $role->update([
                    'name' => $type->name,
                    'code' => $type->code,
                    'level' => $type->level ?? Role::THRESHOLD_STAFF,
                ]);
                $this->clearRoleCache();
            }
        }
    }

    public function deleted(Type $type): void
    {
        if ($type->group === Type::GROUP_USER_ROLE) {
            $role = Role::where('name', $type->name)->where('guard_name', 'web')->first();

            if ($role) {
                $role->delete();
                $this->clearRoleCache();
            }
        }
    }

    public function restored(Type $type): void
    {
        if ($type->group === Type::GROUP_USER_ROLE) {
            $role = Role::withTrashed()->where('name', $type->name)->where('guard_name', 'web')->first();

            if ($role) {
                $role->restore();
                $this->clearRoleCache();
            }
        }
    }
}

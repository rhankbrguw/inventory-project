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
            Role::create([
                'name' => $type->name,
                'code' => $type->code,
                'level' => $type->level ?? 100,
                'guard_name' => 'web'
            ]);
            $this->clearRoleCache();
        }
    }

    public function updated(Type $type): void
    {
        if (($type->isDirty('name') || $type->isDirty('code') || $type->isDirty('level')) &&
            $type->getOriginal('group') === Type::GROUP_USER_ROLE
        ) {

            $oldRole = Role::findByName($type->getOriginal('name'), 'web');

            if ($oldRole) {
                $oldRole->update([
                    'name' => $type->name,
                    'code' => $type->code,
                    'level' => $type->level,
                ]);
                $this->clearRoleCache();
            }
        }
    }

    public function deleted(Type $type): void
    {
        if ($type->group === Type::GROUP_USER_ROLE) {
            $role = Role::findByName($type->name, 'web');
            if ($role) {
                $role->delete();
                $this->clearRoleCache();
            }
        }
    }

    public function restored(Type $type): void
    {
        if ($type->group === Type::GROUP_USER_ROLE) {
            Role::withTrashed()->where('name', $type->name)->first()?->restore();
            $this->clearRoleCache();
        }
    }
}

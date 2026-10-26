<?php

namespace App\Services;

use App\Http\Resources\UserResource;
use App\Models\Location;
use App\Models\Type;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role as SpatieRole;

class UserService
{
    public function getIndexData(User $currentUser, Request $request): array
    {
        $level = $currentUser->level;
        $users = User::query()->with(['roles', 'locations.type'])
            ->whereHas('roles', fn ($q) => $q->where('level', '>=', $level))
            ->when($request->input('search'), fn ($q, $s) => $q->where(fn ($sub) => $sub->where('name', 'like', "%{$s}%")->orWhere('email', 'like', "%{$s}%")))
            ->when($request->input('role'), fn ($q, $r) => $q->whereHas('roles', fn ($sq) => $sq->where('name', 'like', "%{$r}%")))
            ->when($request->input('status'), fn ($q, $st) => $st === 'active' ? $q->whereNull('deleted_at') : ($st === 'inactive' ? $q->whereNotNull('deleted_at') : null))
            ->when($request->filled('location_id') && $request->input('location_id') !== 'all', fn ($q) => $this->applyLocationFilter($q, (string) $request->input('location_id')))
            ->orderBy('name', $request->input('sort') === 'name_desc' ? 'desc' : 'asc')
            ->withTrashed()
            ->paginate(10)
            ->withQueryString();

        return [
            'users' => UserResource::collection($users),
            'roles' => SpatieRole::where('level', '>=', $level)->orderBy('name')->get(['name']),
            'locations' => Location::orderBy('name')->get(['id', 'name']),
            'filters' => (object) $request->only(['search', 'sort', 'role', 'status', 'location_id']),
        ];
    }

    private function applyLocationFilter(\Illuminate\Database\Eloquent\Builder $query, string $loc): void
    {
        if ($loc === 'global') {
            $query->whereHas('roles', fn ($rq) => $rq->where('roles.level', 1));
        } elseif ($loc === 'unassigned') {
            $query->whereDoesntHave('locations')->whereDoesntHave('roles', fn ($rq) => $rq->where('roles.level', 1));
        } else {
            $query->whereHas('locations', fn ($lq) => $lq->where('locations.id', $loc));
        }
    }

    public function createUser(array $validated, User $creator): User
    {
        $roleType = Type::where('group', Type::GROUP_USER_ROLE)->where('name', $validated['role'])->first();
        if (! $roleType || $roleType->level <= $creator->level) {
            abort(403, __('messages.cannot_assign_higher_role'));
        }

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'password' => Hash::make($validated['password']),
        ]);
        $user->assignRole($validated['role']);

        return $user;
    }

    public function updateUser(User $user, array $validated, User $editor): ?string
    {
        if (isset($validated['role'])) {
            $roleType = Type::where('group', Type::GROUP_USER_ROLE)->where('name', $validated['role'])->first();
            if (! $roleType || $roleType->level < $editor->level) {
                abort(403, __('messages.cannot_promote_above'));
            }
        }

        $oldRole = $user->roles->first();
        $user->update(['name' => $validated['name'], 'email' => $validated['email'], 'phone' => $validated['phone'] ?? null]);
        $user->syncRoles($validated['role']);
        $newRole = $user->roles->first();

        $locationCount = $user->locations()->count();
        if ($oldRole && $newRole && $oldRole->id !== $newRole->id && $locationCount > 0) {
            $user->locations()->updateExistingPivot($user->locations->pluck('id')->toArray(), ['role_id' => $newRole->id]);

            return __('messages.user.updated_with_sync', ['count' => $locationCount, 'role' => $newRole->name]);
        }

        return null;
    }

    public function getAssignableRoles(int $userLevel, bool $inclusive = false): array
    {
        $operator = $inclusive ? '>=' : '>';

        return Type::where('group', Type::GROUP_USER_ROLE)
            ->where('level', $operator, $userLevel)
            ->orderBy('name')
            ->pluck('name')
            ->toArray();
    }

    public function deleteUser(User $user, User $currentUser): bool
    {
        if ($user->id === $currentUser->id) {
            return false;
        }

        return (bool) $user->delete();
    }

    public function restoreUser(int|string $id): bool
    {
        $user = User::withTrashed()->findOrFail($id);

        return (bool) $user->restore();
    }

    public function createInitialSuperAdmin(array $adminData): User
    {
        return \Illuminate\Support\Facades\DB::transaction(function () use ($adminData) {
            $user = User::create([
                'name' => $adminData['name'],
                'email' => $adminData['email'],
                'phone' => \App\Rules\ValidPhoneNumber::format($adminData['phone'] ?? null),
                'password' => Hash::make($adminData['password']),
                'email_verified_at' => now(),
            ]);

            \App\Models\Role::firstOrCreate(
                ['name' => \App\Models\Role::NAME_SUPER_ADMIN, 'guard_name' => 'web'],
                ['code' => \App\Models\Role::CODE_SUPER_ADMIN, 'level' => \App\Models\Role::LEVEL_SUPER_ADMIN]
            );

            $user->syncRoles([\App\Models\Role::NAME_SUPER_ADMIN]);
            \App\Models\SystemSetting::markSetupCompleted();

            return $user;
        });
    }
}

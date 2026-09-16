<?php

namespace App\Services;

use App\Http\Resources\LocationResource;
use App\Models\Location;
use App\Models\Type;
use App\Models\User;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;

class LocationService
{
    public function getIndexData(User $user, Request $request): array
    {
        $accessibleIds = $user->getAccessibleLocationIds();
        $locations = Location::query()->with(['type', 'users' => fn ($q) => $q->with('roles')])
            ->when($accessibleIds, fn ($q) => $q->whereIn('id', $accessibleIds))
            ->when($request->input('search'), fn ($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->when($request->input('status'), fn ($q, $st) => $st === 'active' ? $q->whereNull('deleted_at') : ($st === 'inactive' ? $q->whereNotNull('deleted_at') : null))
            ->when($request->input('type_id'), fn ($q, $id) => $q->where('type_id', $id))
            ->withTrashed()->orderBy('name')->paginate(10)->withQueryString();

        return [
            'locations' => LocationResource::collection($locations),
            'locationTypes' => Type::getForGroup(Type::GROUP_LOCATION),
            'filters' => (object) $request->only(['search', 'status', 'type_id']),
        ];
    }

    public function getEditData(Location $location): array
    {
        $location->load(['type', 'users' => fn ($q) => $q->with('roles')]);
        $users = User::with('roles')->orderBy('name')->get()->map(fn ($u) => [
            'id' => $u->id, 'name' => $u->name, 'email' => $u->email,
            'global_role_code' => $u->roles->first()?->code, 'global_level' => $u->level,
        ]);
        $roles = \Illuminate\Support\Facades\Cache::remember('all_roles_list', 3600, fn () => Role::orderBy('level', 'asc')->get()->map(fn ($r) => ['id' => $r->id, 'name' => $r->name, 'code' => $r->code, 'level' => $r->level]));

        return [
            'location' => LocationResource::make($location),
            'locationTypes' => Type::getForGroup(Type::GROUP_LOCATION),
            'allUsers' => $users,
            'allRoles' => $roles,
        ];
    }

    public function validateAssignments(array $assignmentsInput): ?string
    {
        foreach ($assignmentsInput as $item) {
            $user = User::find($item['user_id']);
            $targetRole = Role::find($item['role_id']);
            if ($user && $targetRole && $user->level > $targetRole->level) {
                return __('messages.location.role_level_mismatch', [
                    'user' => $user->name, 'user_level' => $user->level, 'role' => $targetRole->name, 'role_level' => $targetRole->level,
                ]);
            }
        }

        return null;
    }

    public function createLocation(array $attributes): Location
    {
        return Location::create($attributes);
    }

    public function updateLocation(Location $location, array $attributes): bool
    {
        $assignmentsInput = $attributes['assignments'] ?? [];
        $location->update([
            'name' => $attributes['name'],
            'type_id' => $attributes['type_id'],
            'address' => $attributes['address'] ?? null,
        ]);

        $assignments = collect($assignmentsInput)->mapWithKeys(fn ($item) => [$item['user_id'] => ['role_id' => $item['role_id']]]);
        $location->users()->sync($assignments);

        return true;
    }

    public function deleteLocation(Location $location): bool
    {
        return (bool) $location->delete();
    }

    public function restoreLocation(Location $location): bool
    {
        return (bool) $location->restore();
    }
}

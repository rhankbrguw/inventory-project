<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreLocationRequest;
use App\Http\Requests\UpdateLocationRequest;
use App\Http\Resources\LocationResource;
use App\Models\Location;
use App\Models\Type;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class LocationsController extends Controller
{
    public function index(Request $request): Response
    {
        $user = Auth::user();
        $accessibleLocationIds = $user->getAccessibleLocationIds();

        $locations = Location::query()
            ->with(['type', 'users'])
            ->when($accessibleLocationIds, function ($query) use ($accessibleLocationIds) {
                $query->whereIn('id', $accessibleLocationIds);
            })
            ->when($request->input('search'), function ($query, $search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->when($request->input('status'), function ($query, $status) {
                if ($status === 'active') {
                    $query->whereNull('deleted_at');
                } elseif ($status === 'inactive') {
                    $query->whereNotNull('deleted_at');
                }
            })
            ->when($request->input('type_id'), function ($query, $typeId) {
                $query->where('type_id', $typeId);
            })
            ->withTrashed()
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Locations/Index', [
            'locations' => LocationResource::collection($locations),
            'locationTypes' => Type::where('group', Type::GROUP_LOCATION)->get(['id', 'name']),
            'filters' => (object) $request->only(['search', 'status', 'type_id']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Locations/Create', [
            'locationTypes' => Type::where('group', Type::GROUP_LOCATION)
                ->orderBy('name')
                ->get(['id', 'name', 'code', 'level']),
        ]);
    }

    public function store(StoreLocationRequest $request): RedirectResponse
    {
        Location::create($request->validated());

        return Redirect::route('locations.index')
            ->with('success', 'Lokasi baru berhasil ditambahkan.');
    }

    public function edit(Location $location): Response
    {
        $location->load(['type', 'users' => function ($query) {
            $query->with('roles');
        }]);

        $users = User::with('roles')->orderBy('name')->get()->map(function ($u) {
            return [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'global_role_code' => $u->roles->first()?->code,
                'global_level' => $u->level,
            ];
        });

        $roles = Role::where('name', '!=', 'Super Admin')
            ->orderBy('level', 'asc')
            ->get()
            ->map(fn ($r) => [
                'id' => $r->id,
                'name' => $r->name,
                'code' => $r->code,
                'level' => $r->level,
            ]);

        return Inertia::render('Locations/Edit', [
            'location' => LocationResource::make($location),
            'locationTypes' => Type::where('group', Type::GROUP_LOCATION)
                ->orderBy('name')
                ->get(['id', 'name', 'code', 'level']),
            'allUsers' => $users,
            'allRoles' => $roles,
        ]);
    }

    public function update(UpdateLocationRequest $request, Location $location): RedirectResponse
    {
        $validated = $request->validated();

        $location->update([
            'name' => $validated['name'],
            'type_id' => $validated['type_id'],
            'address' => $validated['address'],
        ]);

        $assignments = collect($validated['assignments'] ?? [])
            ->mapWithKeys(function ($assignment) {
                return [$assignment['user_id'] => [
                    'role_id' => $assignment['role_id']
                ]];
            });

        $location->users()->sync($assignments);

        return Redirect::route('locations.index')
            ->with('success', 'Lokasi berhasil diperbarui.');
    }

    public function destroy(Location $location): RedirectResponse
    {
        $location->delete();
        return Redirect::route('locations.index')->with('success', 'Lokasi berhasil dinonaktifkan.');
    }

    public function restore(Location $location): RedirectResponse
    {
        $location->restore();
        return Redirect::route('locations.index')->with('success', 'Lokasi berhasil diaktifkan kembali.');
    }
}

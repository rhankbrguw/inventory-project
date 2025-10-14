<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreLocationRequest;
use App\Http\Requests\UpdateLocationRequest;
use App\Http\Resources\LocationResource;
use App\Http\Resources\RoleResource;
use App\Http\Resources\UserResource;
use App\Models\Location;
use App\Models\Type;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class LocationsController extends Controller
{
   public function index(Request $request): Response
   {
      $locations = Location::query()
         ->with(['type', 'users'])
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

      return inertia('Locations/Index', [
         'locations' => LocationResource::collection($locations),
         'locationTypes' => Type::where('group', Type::GROUP_LOCATION)->get(['id', 'name']),
         'filters' => (object) $request->only(['search', 'status', 'type_id']),
      ]);
   }

   public function create(): Response
   {
      return inertia('Locations/Create', [
         'locationTypes' => Type::where('group', Type::GROUP_LOCATION)
            ->orderBy('name')
            ->get(['id', 'name', 'code']),
      ]);
   }

   public function store(StoreLocationRequest $request): RedirectResponse
   {
      Location::create($request->validated());

      return redirect()->route('locations.index')
         ->with('success', 'Lokasi baru berhasil ditambahkan.');
   }

   public function edit(Location $location): Response
   {
      $location->load(['type', 'users.roles']);

      $users = User::with('roles')->orderBy('name')->get();

      $roleOrder = [
         'Warehouse Manager',
         'Branch Manager',
         'Staff',
         'Cashier',
      ];

      $roles = Role::where('name', '!=', 'Super Admin')
         ->get()
         ->sortBy(function ($role) use ($roleOrder) {
            return array_search($role->name, $roleOrder);
         });

      return inertia('Locations/Edit', [
         'location' => LocationResource::make($location),
         'locationTypes' => Type::where('group', Type::GROUP_LOCATION)
            ->orderBy('name')
            ->get(['id', 'name', 'code']),
         'allUsers' => UserResource::collection($users),
         'allRoles' => RoleResource::collection($roles),
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
            return [$assignment['user_id'] => ['role_id' => $assignment['role_id']]];
         });

      $location->users()->sync($assignments);

      return redirect()->route('locations.index')
         ->with('success', 'Lokasi berhasil diperbarui.');
   }

   public function destroy(Location $location): RedirectResponse
   {
      $location->delete();

      return redirect()->route('locations.index')
         ->with('success', 'Lokasi berhasil dinonaktifkan.');
   }

   public function restore(Location $location): RedirectResponse
   {
      $location->restore();

      return redirect()->route('locations.index')
         ->with('success', 'Lokasi berhasil diaktifkan kembali.');
   }
}

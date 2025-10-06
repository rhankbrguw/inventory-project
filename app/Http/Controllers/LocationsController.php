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
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class LocationsController extends Controller
{
   public function index(Request $request)
   {
      $locations = Location::query()
         ->with(['type', 'users'])
         ->when($request->input('search'), function ($query, $search) {
            $query->where('name', 'like', "%{$search}%");
         })
         ->when($request->input('status'), function ($query, $status) {
            if ($status === 'active') {
               $query->whereNull('deleted_at');
            }
            if ($status === 'inactive') {
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

   public function create()
   {
      return Inertia::render('Locations/Create', [
         'locationTypes' => Type::where('group', Type::GROUP_LOCATION)->orderBy('name')->get(['id', 'name', 'code']),
      ]);
   }

   public function store(StoreLocationRequest $request)
   {
      Location::create($request->validated());
      return Redirect::route('locations.index')->with('success', 'Lokasi baru berhasil ditambahkan.');
   }

   public function edit(Location $location)
   {
      $location->load(['type', 'users.roles']);

      $users = User::query()->with('roles')->orderBy('name')->get();

      $roleOrder = [
         'Warehouse Manager',
         'Branch Manager',
         'Staff',
         'Cashier',
      ];

      $roles = Role::query()->where('name', '!=', 'Super Admin')->get()->sortBy(function ($role) use ($roleOrder) {
         return array_search($role->name, $roleOrder);
      });

      return Inertia::render('Locations/Edit', [
         'location' => LocationResource::make($location),
         'locationTypes' => Type::where('group', Type::GROUP_LOCATION)->orderBy('name')->get(['id', 'name', 'code']),
         'allUsers' => UserResource::collection($users),
         'allRoles' => RoleResource::collection($roles),
      ]);
   }

   public function update(UpdateLocationRequest $request, Location $location)
   {
      $validated = $request->validated();

      $location->update([
         'name' => $validated['name'],
         'type_id' => $validated['type_id'],
         'address' => $validated['address'],
      ]);

      $assignments = collect($validated['assignments'] ?? [])->mapWithKeys(function ($assignment) {
         return [$assignment['user_id'] => ['role_id' => $assignment['role_id']]];
      });

      $location->users()->sync($assignments);

      return Redirect::route('locations.index')->with('success', 'Lokasi berhasil diperbarui.');
   }

   public function destroy(Location $location)
   {
      $location->delete();
      return Redirect::route('locations.index')->with('success', 'Lokasi berhasil dinonaktifkan.');
   }

   public function restore(Location $location)
   {
      $location->restore();
      return Redirect::route('locations.index')->with('success', 'Lokasi berhasil diaktifkan kembali.');
   }
}

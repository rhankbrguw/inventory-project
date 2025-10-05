<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreLocationRequest;
use App\Http\Requests\UpdateLocationRequest;
use App\Http\Resources\LocationResource;
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
      $locations = Location::with(['type', 'users'])
         ->withTrashed()
         ->when($request->input('search'), function ($query, $search) {
            $query->where('name', 'like', "%{$search}%");
         })
         ->when($request->input('status'), function ($query, $status) {
            if ($status === 'active') $query->whereNull('deleted_at');
            if ($status === 'inactive') $query->whereNotNull('deleted_at');
         })
         ->orderBy('name')
         ->get();

      return Inertia::render('Locations/Index', [
         'locations' => LocationResource::collection($locations),
         'locationTypes' => Type::where('group', Type::GROUP_LOCATION)->get(['id', 'name']),
         'filters' => (object) $request->only(['search', 'status']),
      ]);
   }

   public function create()
   {
      return Inertia::render('Locations/Create', [
         'locationTypes' => Type::where('group', Type::GROUP_LOCATION)->orderBy('name')->get(['id', 'name']),
      ]);
   }

   public function store(StoreLocationRequest $request)
   {
      Location::create($request->validated());
      return Redirect::route('locations.index')->with('success', 'Lokasi baru berhasil ditambahkan.');
   }

   public function edit(Location $location)
   {
      return Inertia::render('Locations/Edit', [
         'location' => LocationResource::make($location->load('type', 'users.roles')),
         'locationTypes' => Type::where('group', Type::GROUP_LOCATION)->orderBy('name')->get(['id', 'name']),
         'allUsers' => User::orderBy('name')->get(['id', 'name']),
         'allRoles' => Role::orderBy('name')->get(['id', 'name']),
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

      if (isset($validated['assignments'])) {
         $syncData = collect($validated['assignments'])->mapWithKeys(function ($assignment) {
            return [$assignment['user_id'] => ['role_id' => $assignment['role_id']]];
         });
         $location->users()->sync($syncData);
      } else {
         $location->users()->sync([]);
      }

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

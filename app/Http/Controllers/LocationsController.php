<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreLocationRequest;
use App\Models\Location;
use App\Models\Type;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;
use Spatie\Permission\Models\Role;

class LocationsController extends Controller
{
   public function index(Request $request)
   {
      $locations = Location::with(['type', 'users'])
         ->withTrashed()
         ->when($request->input('search'), function ($query, $search) {
            $query->where('name', 'like', "%{$search}%")
               ->orWhereHas('users', fn($q) => $q->where('name', 'like', "%{$search}%"));
         })
         ->when($request->input('status'), function ($query, $status) {
            if ($status === 'active') $query->whereNull('deleted_at');
            if ($status === 'inactive') $query->whereNotNull('deleted_at');
         })
         ->orderBy('name')
         ->get();

      return Inertia::render('Locations/Index', [
         'locations' => $locations,
         'locationTypes' => Type::where('group', Type::GROUP_LOCATION)->get(['id', 'name']),
         'filters' => (object) $request->only(['search', 'type_id', 'status']),
      ]);
   }

   public function restore(Location $location)
   {
      $location->restore();
      return Redirect::route('locations.index')->with('success', 'Lokasi berhasil diaktifkan kembali.');
   }

   private function getFormData()
   {
      $branchManagerRole = Role::where('name', 'Branch Manager')->first();
      $warehouseManagerRole = Role::where('name', 'Warehouse Manager')->first();

      return [
         'locationTypes' => Type::where('group', Type::GROUP_LOCATION)->orderBy('name')->get(['id', 'name']),
         'branchManagers' => $branchManagerRole ? $branchManagerRole->users()->get(['id', 'name']) : [],
         'warehouseManagers' => $warehouseManagerRole ? $warehouseManagerRole->users()->get(['id', 'name']) : [],
      ];
   }

   public function create()
   {
      return Inertia::render('Locations/Create', $this->getFormData());
   }

   public function store(StoreLocationRequest $request)
   {
      Location::create($request->validated());
      return Redirect::route('locations.index')->with('success', 'Lokasi baru berhasil ditambahkan.');
   }

   public function edit(Location $location)
   {
      return Inertia::render('Locations/Edit', array_merge($this->getFormData(), [
         'location' => $location->load('type'),
      ]));
   }

   public function update(StoreLocationRequest $request, Location $location)
   {
      $location->update($request->validated());
      return Redirect::route('locations.index')->with('success', 'Lokasi berhasil diperbarui.');
   }

   public function destroy(Location $location)
   {
      if ($location->inventories()->where('quantity', '>', 0)->exists()) {
         return Redirect::back()->with('error', 'Lokasi tidak dapat dihapus karena masih ada stok.');
      }

      $location->delete();
      return Redirect::route('locations.index')->with('success', 'Lokasi berhasil dihapus.');
   }
}

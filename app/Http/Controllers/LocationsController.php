<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreLocationRequest;
use App\Models\Location;
use App\Models\Type;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;

class LocationsController extends Controller
{
   public function index()
   {
      return Inertia::render('Locations/Index', [
         'locations' => Location::orderBy('name')->get(),
      ]);
   }

   public function create()
   {
      return Inertia::render('Locations/Create', [
         'locationTypes' => Type::where('group', Type::GROUP_LOCATION)->orderBy('name')->get(),
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
         'location' => $location,
         'locationTypes' => Type::where('group', Type::GROUP_LOCATION)->orderBy('name')->get(),
      ]);
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

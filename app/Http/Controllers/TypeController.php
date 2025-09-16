<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTypeRequest;
use App\Http\Requests\UpdateTypeRequest;
use App\Models\Type;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class TypeController extends Controller
{
   public function index()
   {
      $types = Type::orderBy('group')->orderBy('name')->get();

      return Inertia::render('Types/Index', [
         'types' => $types
      ]);
   }

   public function create()
   {
      return Inertia::render('Types/Create', [
         'availableGroups' => Type::getAvailableGroups(),
         'allTypes' => Type::all()->groupBy('group'),
      ]);
   }

   public function store(StoreTypeRequest $request)
   {
      Type::create($request->validated());

      return Redirect::back()->with('success', 'Tipe baru berhasil ditambahkan.');
   }

   public function edit(Type $type)
   {
      return Inertia::render('Types/Edit', [
         'type' => $type,
         'availableGroups' => Type::getAvailableGroups(),
         'allTypes' => Type::all()->groupBy('group'),
      ]);
   }

   public function update(UpdateTypeRequest $request, Type $type)
   {
      $type->update($request->validated());

      return Redirect::route('types.index')->with('success', 'Tipe berhasil diperbarui.');
   }

   public function destroy(Type $type)
   {
      if ($type->products()->exists()) {
         return Redirect::back()->with('error', 'Tipe ini tidak dapat dihapus karena masih digunakan oleh produk.');
      }

      $type->delete();

      return Redirect::route('types.index')->with('success', 'Tipe berhasil dihapus.');
   }
}

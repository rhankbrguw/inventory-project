<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTypeRequest;
use App\Http\Requests\UpdateTypeRequest;
use App\Http\Resources\TypeResource;
use App\Models\Type;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class TypeController extends Controller
{
   public function index(Request $request)
   {
      $types = Type::query()
         ->when($request->input('search'), function ($query, $search) {
            $query->where('name', 'like', "%{$search}%")
               ->orWhere('code', 'like', "%{$search}%");
         })
         ->when($request->input('group'), function ($query, $group) {
            $query->where('group', 'like', "%{$group}%");
         })
         ->orderBy('group')->orderBy('name')
         ->paginate(15)
         ->withQueryString();

      return Inertia::render('Types/Index', [
         'types' => TypeResource::collection($types),
         'filters' => (object) $request->only(['search', 'group']),
         'groups' => Type::getAvailableGroups(),
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

      if ($request->input('_from_modal')) {
         return Redirect::back()->with('success', 'Tipe baru berhasil ditambahkan.');
      }

      return Redirect::route('types.index')->with('success', 'Tipe baru berhasil ditambahkan.');
   }

   public function edit(Type $type)
   {
      return Inertia::render('Types/Edit', [
         'type' => TypeResource::make($type),
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

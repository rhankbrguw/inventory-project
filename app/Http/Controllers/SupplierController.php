<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSupplierRequest;
use App\Http\Requests\UpdateSupplierRequest;
use App\Http\Resources\SupplierResource;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class SupplierController extends Controller
{
   public function index(Request $request)
   {
      $suppliers = Supplier::query()
         ->when($request->input('search'), function ($query, $search) {
            $query->where(function ($q) use ($search) {
               $q->where('name', 'like', "%{$search}%")
                  ->orWhere('contact_person', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
         })
         ->when($request->input('sort'), function ($query, $sort) {
            if ($sort === 'name_asc') $query->orderBy('name', 'asc');
            if ($sort === 'name_desc') $query->orderBy('name', 'desc');
         }, function ($query) {
            $query->orderBy('name', 'asc');
         })
         ->paginate(10)
         ->withQueryString();

      return Inertia::render('Suppliers/Index', [
         'suppliers' => SupplierResource::collection($suppliers),
         'filters' => (object) $request->only(['search', 'sort']),
      ]);
   }

   public function create()
   {
      return Inertia::render('Suppliers/Create');
   }

   public function store(StoreSupplierRequest $request)
   {
      Supplier::create($request->validated());
      return Redirect::route('suppliers.index')->with('success', 'Supplier berhasil ditambahkan.');
   }

   public function edit(Supplier $supplier)
   {
      return Inertia::render('Suppliers/Edit', [
         'supplier' => SupplierResource::make($supplier)
      ]);
   }

   public function update(UpdateSupplierRequest $request, Supplier $supplier)
   {
      $supplier->update($request->validated());
      return Redirect::route('suppliers.index')->with('success', 'Supplier berhasil diperbarui.');
   }

   public function destroy(Supplier $supplier)
   {
      $supplier->delete();
      return Redirect::route('suppliers.index')->with('success', 'Supplier berhasil dihapus.');
   }
}

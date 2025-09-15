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
   public function index()
   {
      $suppliers = Supplier::latest()->paginate(10);

      return Inertia::render('Suppliers/Index', [
         'suppliers' => SupplierResource::collection($suppliers),
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

   public function show(Supplier $supplier)
   {
      //
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

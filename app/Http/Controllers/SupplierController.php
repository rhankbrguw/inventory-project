<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSupplierRequest;
use App\Http\Requests\UpdateSupplierRequest;
use App\Http\Resources\SupplierResource;
use App\Models\Supplier;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class SupplierController extends Controller
{
   public function index(Request $request): Response
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
            match ($sort) {
               'name_asc' => $query->orderBy('name', 'asc'),
               'name_desc' => $query->orderBy('name', 'desc'),
               default => $query->orderBy('name', 'asc'),
            };
         }, function ($query) {
            $query->orderBy('name', 'asc');
         })
         ->paginate(10)
         ->withQueryString();

      return inertia('Suppliers/Index', [
         'suppliers' => SupplierResource::collection($suppliers),
         'filters' => (object) $request->only(['search', 'sort']),
      ]);
   }

   public function create(): Response
   {
      return inertia('Suppliers/Create');
   }

   public function store(StoreSupplierRequest $request): RedirectResponse
   {
      Supplier::create($request->validated());

      return redirect()->route('suppliers.index')
         ->with('success', 'Supplier berhasil ditambahkan.');
   }

   public function edit(Supplier $supplier): Response
   {
      return inertia('Suppliers/Edit', [
         'supplier' => SupplierResource::make($supplier),
      ]);
   }

   public function update(UpdateSupplierRequest $request, Supplier $supplier): RedirectResponse
   {
      $supplier->update($request->validated());

      return redirect()->route('suppliers.index')
         ->with('success', 'Supplier berhasil diperbarui.');
   }

   public function destroy(Supplier $supplier): RedirectResponse
   {
      $supplier->delete();

      return redirect()->route('suppliers.index')
         ->with('success', 'Supplier berhasil dihapus.');
   }
}

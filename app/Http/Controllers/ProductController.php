<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Models\Supplier;
use App\Models\Type;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ProductController extends Controller
{
   public function index(Request $request)
   {
      $products = Product::with(['type', 'defaultSupplier'])
         ->when($request->input('supplier_id'), function ($query, $supplierId) {
            $query->where('default_supplier_id', $supplierId);
         })
         ->latest()
         ->paginate(10)
         ->withQueryString();

      return Inertia::render('Products/Index', [
         'products' => ProductResource::collection($products),
         'suppliers' => Supplier::all(['id', 'name']),
         'productTypes' => Type::where('group', 'product_type')->get(['id', 'name']),
         'filters' => (object) $request->only(['supplier_id']),
      ]);
   }

   public function create()
   {
      return Inertia::render('Products/Create', [
         'types' => Type::where('group', 'product_type')->get(),
         'suppliers' => Supplier::all(['id', 'name']),
      ]);
   }

   public function store(StoreProductRequest $request)
   {
      $validated = $request->validated();

      if ($request->hasFile('image')) {
         $path = $request->file('image')->store('products', 'public');
         $validated['image_path'] = $path;
      }

      Product::create($validated);

      return redirect()->route('products.index')->with('success', 'Produk berhasil ditambahkan.');
   }

   public function edit(Product $product)
   {
      $product->load(['type', 'defaultSupplier']);

      return Inertia::render('Products/Edit', [
         'product' => ProductResource::make($product),
         'types' => Type::where('group', 'product_type')->get(),
         'suppliers' => Supplier::all(['id', 'name']),
      ]);
   }

   public function update(UpdateProductRequest $request, Product $product)
   {
      $validated = $request->validated();

      if ($request->hasFile('image')) {
         if ($product->image_path) {
            Storage::disk('public')->delete($product->image_path);
         }
         $path = $request->file('image')->store('products', 'public');
         $validated['image_path'] = $path;
      }

      $product->update($validated);

      return redirect()->route('products.index')->with('success', 'Produk berhasil diperbarui.');
   }

   public function destroy(Product $product)
   {
      if ($product->image_path) {
         Storage::disk('public')->delete($product->image_path);
      }

      $product->delete();

      return Redirect::route('products.index')->with('success', 'Produk berhasil dihapus.');
   }
}

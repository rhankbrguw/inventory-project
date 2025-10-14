<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Models\Supplier;
use App\Models\Type;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Response;

class ProductController extends Controller
{
   public function index(Request $request): Response
   {
      $products = Product::with(['type', 'defaultSupplier'])
         ->when($request->input('search'), function ($query, $search) {
            $query->where(function ($q) use ($search) {
               $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
            });
         })
         ->when($request->input('supplier_id'), function ($query, $supplierId) {
            $query->where('default_supplier_id', $supplierId);
         })
         ->when($request->input('sort'), function ($query, $sort) {
            match ($sort) {
               'price_asc' => $query->orderBy('price', 'asc'),
               'price_desc' => $query->orderBy('price', 'desc'),
               'newest' => $query->orderBy('created_at', 'desc'),
               'oldest' => $query->orderBy('created_at', 'asc'),
               default => $query->latest('id'),
            };
         }, function ($query) {
            $query->latest('id');
         })
         ->paginate(10)
         ->withQueryString();

      return inertia('Products/Index', [
         'products' => ProductResource::collection($products),
         'suppliers' => Supplier::orderBy('name')->get(['id', 'name']),
         'productTypes' => Type::where('group', Type::GROUP_PRODUCT)->get(['id', 'name']),
         'filters' => (object) $request->only(['search', 'supplier_id', 'sort']),
      ]);
   }

   public function create(): Response
   {
      return inertia('Products/Create', [
         'types' => Type::where('group', Type::GROUP_PRODUCT)->orderBy('name')->get(),
         'suppliers' => Supplier::orderBy('name')->get(['id', 'name']),
      ]);
   }

   public function store(StoreProductRequest $request): RedirectResponse
   {
      $validated = $request->validated();

      if ($request->hasFile('image')) {
         $validated['image_path'] = $request->file('image')->store('products', 'public');
      }

      Product::create($validated);

      return redirect()->route('products.index')
         ->with('success', 'Produk berhasil ditambahkan.');
   }

   public function edit(Product $product): Response
   {
      return inertia('Products/Edit', [
         'product' => ProductResource::make($product->load(['type', 'defaultSupplier'])),
         'types' => Type::where('group', Type::GROUP_PRODUCT)->orderBy('name')->get(),
         'suppliers' => Supplier::orderBy('name')->get(['id', 'name']),
      ]);
   }

   public function update(UpdateProductRequest $request, Product $product): RedirectResponse
   {
      $validated = $request->validated();

      if ($request->hasFile('image')) {
         if ($product->image_path) {
            Storage::disk('public')->delete($product->image_path);
         }

         $validated['image_path'] = $request->file('image')->store('products', 'public');
      }

      $product->update($validated);

      return redirect()->route('products.index')
         ->with('success', 'Produk berhasil diperbarui.');
   }

   public function destroy(Product $product): RedirectResponse
   {
      if ($product->image_path) {
         Storage::disk('public')->delete($product->image_path);
      }

      $product->delete();

      return redirect()->route('products.index')
         ->with('success', 'Produk berhasil dihapus.');
   }
}

<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Location;
use App\Models\Product;
use App\Models\Type;
use App\Models\Supplier;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ProductController extends Controller
{
   public function index()
   {
      $products = Product::latest()->paginate(10);
      return Inertia::render('Products/Index', [
         'products' => ProductResource::collection($products),
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

   public function show(Product $product)
   {
      //
   }

   public function edit(Product $product)
   {
      $product->load('locations');
      $branches = Location::where('type', 'branch')->get();

      return Inertia::render('Products/Edit', [
         'product' => new ProductResource($product),
         'branches' => $branches,
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
}

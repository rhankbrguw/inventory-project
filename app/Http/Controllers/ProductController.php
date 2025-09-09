<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Location;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
      $branches = Location::where('type', 'branch')->get();
      return Inertia::render('Products/Create', [
         'branches' => $branches,
      ]);
   }

   public function store(StoreProductRequest $request)
   {
      DB::transaction(function () use ($request) {
         $product = Product::create($request->safe()->except('branches'));
         if ($request->has('branches')) {
            $product->locations()->attach($request->validated('branches'));
         }
      });

      return to_route('products.index')->with('success', 'Produk berhasil ditambahkan.');
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
      DB::transaction(function () use ($request, $product) {
         $product->update($request->safe()->except('branches'));
         if ($request->has('branches')) {
            $product->locations()->sync($request->validated('branches'));
         } else {
            $product->locations()->detach();
         }
      });

      return to_route('products.index')->with('success', 'Produk berhasil diperbarui.');
   }

   public function destroy(Product $product)
   {
      $product->delete();
      return to_route('products.index')->with('success', 'Produk berhasil dihapus.');
   }
}

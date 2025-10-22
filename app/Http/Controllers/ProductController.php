<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Http\Resources\SupplierResource;
use App\Http\Resources\TypeResource;
use App\Models\Product;
use App\Models\Supplier;
use App\Models\Type;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        $products = Product::query()
            ->with(['type', 'defaultSupplier'])
            ->withSum('inventories', 'quantity')
            ->when($request->input('search'), function ($query, $search) {
                $query
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%");
            })
            ->when($request->input('status'), function ($query, $status) {
                if ($status === 'active') {
                    $query->whereNull('deleted_at');
                } elseif ($status === 'inactive') {
                    $query->whereNotNull('deleted_at');
                }
            })
            ->when($request->input('product_id'), function ($query, $productId) {
                $query->where('id', $productId);
            })
            ->withTrashed()
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Products/Index', [
            'products' => ProductResource::collection($products),
            'allProducts' => Product::orderBy('name')->get(['id', 'name', 'sku']),
            'suppliers' => SupplierResource::collection(Supplier::orderBy('name')->get()),
            'productTypes' => TypeResource::collection(Type::where('group', Type::GROUP_PRODUCT)->get()),
            'filters' => (object) $request->only(['search', 'status', 'sort', 'product_id']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Products/Create', [
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

        return Redirect::route('products.index')->with('success', 'Produk baru berhasil ditambahkan.');
    }

    public function edit(Product $product): Response
    {
        return Inertia::render('Products/Edit', [
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

        return Redirect::route('products.index')
            ->with('success', 'Produk berhasil diperbarui.');
    }

    public function destroy(Product $product): RedirectResponse
    {
        if ($product->inventories()->where('quantity', '>', 0)->exists()) {
            return Redirect::back()->with('error', 'Produk ini tidak dapat dinonaktifkan karena masih memiliki stok di inventaris.');
        }

        $product->delete();

        return Redirect::route('products.index')->with('success', 'Produk berhasil dinonaktifkan.');
    }

    public function restore(Product $product): RedirectResponse
    {
        $product->restore();

        return Redirect::route('products.index')->with('success', 'Produk berhasil diaktifkan kembali.');
    }
}

<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Http\Resources\SupplierResource;
use App\Http\Resources\TypeResource;
use App\Models\Inventory;
use App\Models\Product;
use App\Models\SalesChannel;
use App\Models\Supplier;
use App\Models\Type;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    private const VALID_UNITS = ['kg', 'ons', 'pcs', 'ekor', 'pack', 'box'];

    public function index(Request $request): Response
    {
        $user = Auth::user();
        $accessibleLocationIds = $user->getAccessibleLocationIds();

        $products = Product::query()
            ->with(['type', 'defaultSupplier'])
            ->when($accessibleLocationIds, function ($query) use ($accessibleLocationIds) {
                $query->whereHas('inventories', function ($q) use ($accessibleLocationIds) {
                    $q->whereIn('location_id', $accessibleLocationIds);
                });
            })
            ->when($request->input('search'), function ($query, $search) {
                $query
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%");
            })
            ->when($request->input('type_id'), function ($query, $typeId) {
                if ($typeId !== 'all') {
                    $query->where('type_id', $typeId);
                }
            })
            ->when($request->input('status'), function ($query, $status) {
                if ($status === 'active') {
                    $query->whereNull('deleted_at');
                } elseif ($status === 'inactive') {
                    $query->whereNotNull('deleted_at');
                }
            })
            ->when($request->input('sort'), function ($query, $sort) {
                match ($sort) {
                    'newest' => $query->latest(),
                    'oldest' => $query->oldest(),
                    'price_desc' => $query->orderBy('price', 'desc'),
                    'price_asc' => $query->orderBy('price', 'asc'),
                    default => $query->latest(),
                };
            }, function ($query) {
                $query->latest();
            })
            ->withTrashed()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Products/Index', [
            'products' => ProductResource::collection($products),
            'allProducts' => Product::orderBy('name')->get(['id', 'name', 'sku']),
            'suppliers' => SupplierResource::collection(Supplier::orderBy('name')->get()),
            'productTypes' => TypeResource::collection(Type::where('group', Type::GROUP_PRODUCT)->orderBy('name')->get()),
            'filters' => (object) $request->only(['search', 'status', 'sort', 'type_id']),
        ]);
    }

    public function search(Request $request)
    {
        $query = $request->input('query');

        $products = Product::query()
            ->select('id', 'name', 'sku', 'unit', 'price', 'image_path')
            ->whereNull('deleted_at')
            ->where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                    ->orWhere('sku', 'like', "%{$query}%");
            })
            ->limit(20)
            ->get();

        return response()->json($products);
    }

    public function create(): Response
    {
        return Inertia::render('Products/Create', [
            'types' => Type::where('group', Type::GROUP_PRODUCT)->orderBy('name')->get(),
            'suppliers' => Supplier::orderBy('name')->get(['id', 'name']),
            'validUnits' => self::VALID_UNITS,
            'salesChannels' => SalesChannel::where('is_active', true)->orderBy('name')->get(['id', 'name', 'code']),
        ]);
    }

    public function store(StoreProductRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $channelPrices = $validated['channel_prices'] ?? [];
        unset($validated['channel_prices']);

        $supplierIds = $validated['suppliers'] ?? [];
        unset($validated['suppliers']);

        $user = $request->user();

        if ($request->hasFile('image')) {
            $validated['image_path'] = $request->file('image')->store('products', 'public');
        }

        DB::transaction(function () use ($validated, $supplierIds, $channelPrices, $user) {
            $product = Product::create($validated);

            if (!empty($supplierIds)) {
                $product->suppliers()->sync($supplierIds);
            }
            if ($product->default_supplier_id && !in_array($product->default_supplier_id, $supplierIds)) {
                $product->suppliers()->attach($product->default_supplier_id);
            }

            foreach ($channelPrices as $channelId => $price) {
                if ($price !== null && $price !== '') {
                    $product->prices()->create([
                        'sales_channel_id' => $channelId,
                        'price' => $price
                    ]);
                }
            }

            $accessibleLocationIds = $user->getAccessibleLocationIds();
            if ($accessibleLocationIds) {
                foreach ($accessibleLocationIds as $locationId) {
                    Inventory::firstOrCreate([
                        'product_id' => $product->id,
                        'location_id' => $locationId,
                    ], ['quantity' => 0, 'average_cost' => 0]);
                }
            }
        });

        return Redirect::route('products.index')->with('success', 'Produk baru berhasil ditambahkan.');
    }

    public function edit(Product $product): Response
    {
        $product->load(['type', 'defaultSupplier', 'suppliers', 'prices']);

        return Inertia::render('Products/Edit', [
            'product' => ProductResource::make($product),
            'types' => Type::where('group', Type::GROUP_PRODUCT)->orderBy('name')->get(),
            'suppliers' => Supplier::orderBy('name')->get(['id', 'name']),
            'validUnits' => self::VALID_UNITS,
            'salesChannels' => SalesChannel::where('is_active', true)->orderBy('name')->get(['id', 'name', 'code']),
        ]);
    }

    public function update(UpdateProductRequest $request, Product $product): RedirectResponse
    {
        $validated = $request->validated();

        $channelPrices = $validated['channel_prices'] ?? [];
        unset($validated['channel_prices']);

        $supplierIds = $validated['suppliers'] ?? [];
        unset($validated['suppliers']);

        if ($request->hasFile('image')) {
            if ($product->image_path) {
                Storage::disk('public')->delete($product->image_path);
            }
            $validated['image_path'] = $request->file('image')->store('products', 'public');
        }

        DB::transaction(function () use ($product, $validated, $supplierIds, $channelPrices) {
            $product->update($validated);
            $product->suppliers()->sync($supplierIds);

            if ($product->default_supplier_id && !in_array($product->default_supplier_id, $supplierIds)) {
                $product->suppliers()->attach($product->default_supplier_id);
            }

            foreach ($channelPrices as $channelId => $price) {
                if ($price !== null && $price !== '') {
                    $product->prices()->updateOrCreate(
                        ['sales_channel_id' => $channelId],
                        ['price' => $price]
                    );
                } else {
                    $product->prices()->where('sales_channel_id', $channelId)->delete();
                }
            }
        });

        return Redirect::route('products.index')->with('success', 'Produk berhasil diperbarui.');
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

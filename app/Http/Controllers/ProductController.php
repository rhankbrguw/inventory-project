<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Http\Resources\SupplierResource;
use App\Http\Resources\TypeResource;
use App\Models\Inventory;
use App\Models\Product;
use App\Models\Supplier;
use App\Models\Type;
use App\Models\Role;
use App\Models\Location;
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

        $products = Product::query()
            ->with(['type', 'defaultSupplier'])
            ->accessibleBy($user)
            ->when($request->input('search'), function ($query, $search) {
                $query->where(fn ($q) => $q->where('name', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%"));
            })
            ->when($request->input('type_id') && $request->input('type_id') !== 'all', function ($query) use ($request) {
                $query->where('type_id', $request->input('type_id'));
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
            }, fn ($query) => $query->latest())
            ->withTrashed()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Products/Index', [
            'products' => ProductResource::collection($products),
            'allProducts' => Product::orderBy('name')->get(['id', 'name', 'sku']),
            'suppliers' => SupplierResource::collection(Supplier::accessibleBy($user)->orderBy('name')->get()),
            'productTypes' => TypeResource::collection(
                Type::where('group', Type::GROUP_PRODUCT)->orderBy('name')->get()
            ),
            'salesChannels' => TypeResource::collection(
                Type::where('group', Type::GROUP_SALES_CHANNEL)->orderBy('name')->get()
            ),
            'filters' => (object) $request->only(['search', 'status', 'sort', 'type_id']),
        ]);
    }

    public function search(Request $request)
    {
        $query = $request->input('query');
        $user = $request->user();

        return Product::query()
            ->select('id', 'name', 'sku', 'unit', 'price', 'image_path')
            ->accessibleBy($user)
            ->whereNull('deleted_at')
            ->where(fn ($q) => $q->where('name', 'like', "%{$query}%")->orWhere('sku', 'like', "%{$query}%"))
            ->limit(20)
            ->get();
    }

    public function create(): Response
    {
        $user = Auth::user();

        return Inertia::render('Products/Create', [
            'types' => Type::where('group', Type::GROUP_PRODUCT)->orderBy('name')->get(),
            'suppliers' => Supplier::accessibleBy($user)->orderBy('name')->get(['id', 'name']),
            'validUnits' => self::VALID_UNITS,
            'salesChannels' => Type::where('group', Type::GROUP_SALES_CHANNEL)
                ->orderBy('name')
                ->get(['id', 'name', 'code']),
        ]);
    }

    public function store(StoreProductRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $user = $request->user();

        if ($user->level === Role::LEVEL_SUPER_ADMIN) {
            $validated['location_id'] = null;
        } else {
            $validated['location_id'] = $user->locations->first()?->id;
        }

        $channelPrices = $validated['channel_prices'] ?? [];
        unset($validated['channel_prices']);

        $supplierIds = $validated['suppliers'] ?? [];
        unset($validated['suppliers']);

        if ($request->hasFile('image')) {
            $validated['image_path'] = $request->file('image')->store('products', 'public');
        }
        unset($validated['image']);

        DB::transaction(function () use ($validated, $supplierIds, $channelPrices, $user) {
            $product = Product::create($validated);

            if ($supplierIds) {
                $product->suppliers()->sync($supplierIds);
            }

            if ($product->default_supplier_id && !in_array($product->default_supplier_id, $supplierIds)) {
                $product->suppliers()->attach($product->default_supplier_id);
            }

            foreach ($channelPrices as $channelId => $price) {
                if ($price !== null && $price !== '') {
                    $product->prices()->create([
                        'type_id' => $channelId,
                        'price' => $price,
                    ]);
                }
            }

            $targetLocations = $user->level === Role::LEVEL_SUPER_ADMIN
                ? Location::pluck('id')->toArray()
                : ($user->getAccessibleLocationIds() ?? []);

            foreach ($targetLocations as $locationId) {
                if ($locationId !== 0) {
                    Inventory::firstOrCreate(
                        ['product_id' => $product->id, 'location_id' => $locationId],
                        ['quantity' => 0, 'average_cost' => 0]
                    );
                }
            }
        });

        return Redirect::route('products.index')
            ->with('success', 'Produk baru berhasil ditambahkan.');
    }

    public function edit(Product $product): Response
    {
        $user = Auth::user();

        if ($user->cannot('update', $product)) {
            abort(403);
        }

        $product->load(['type', 'defaultSupplier', 'suppliers', 'prices']);

        $localOverride = null;
        if ($user->level !== Role::LEVEL_SUPER_ADMIN) {
            $locationId = $user->locations->first()?->id;
            if ($locationId) {
                $localOverride = Inventory::where('product_id', $product->id)
                    ->where('location_id', $locationId)
                    ->first();
            }
        }

        return Inertia::render('Products/Edit', [
            'product' => ProductResource::make($product),
            'localOverride' => $localOverride ? [
                'selling_price' => $localOverride->selling_price,
                'local_supplier_id' => $localOverride->local_supplier_id,
            ] : null,
            'types' => Type::where('group', Type::GROUP_PRODUCT)->orderBy('name')->get(),
            'suppliers' => Supplier::accessibleBy($user)->orderBy('name')->get(['id', 'name']),
            'validUnits' => self::VALID_UNITS,
            'salesChannels' => Type::where('group', Type::GROUP_SALES_CHANNEL)
                ->orderBy('name')
                ->get(['id', 'name', 'code']),
        ]);
    }

    public function update(UpdateProductRequest $request, Product $product): RedirectResponse
    {
        $validated = $request->validated();
        $user = $request->user();

        if ($user->cannot('update', $product)) {
            abort(403);
        }

        DB::transaction(function () use ($product, $validated, $request, $user) {

            if ($user->level === Role::LEVEL_SUPER_ADMIN) {

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
                unset($validated['image']);

                $product->update($validated);

                $product->suppliers()->sync($supplierIds);
                if ($product->default_supplier_id && !in_array($product->default_supplier_id, $supplierIds)) {
                    $product->suppliers()->attach($product->default_supplier_id);
                }

                foreach ($channelPrices as $channelId => $price) {
                    if ($price !== null && $price !== '') {
                        $product->prices()->updateOrCreate(['type_id' => $channelId], ['price' => $price]);
                    } else {
                        $product->prices()->where('type_id', $channelId)->delete();
                    }
                }
            } else {

                $locationId = $user->locations->first()?->id;

                if ($locationId) {
                    $inventory = Inventory::firstOrCreate(
                        ['product_id' => $product->id, 'location_id' => $locationId],
                        ['quantity' => 0, 'average_cost' => 0]
                    );

                    if (isset($validated['price'])) {
                        $inventory->selling_price = $validated['price'];
                    }

                    if (isset($validated['default_supplier_id'])) {
                        $inventory->local_supplier_id = $validated['default_supplier_id'];
                    }

                    $inventory->save();
                }
            }
        });

        return Redirect::route('products.index')
            ->with('success', 'Produk berhasil diperbarui.');
    }

    public function destroy(Product $product): RedirectResponse
    {
        if ($product->inventories()->where('quantity', '>', 0)->exists()) {
            return Redirect::back()
                ->with('error', 'Produk ini tidak dapat dinonaktifkan karena masih memiliki stok.');
        }

        $product->delete();

        return Redirect::route('products.index')
            ->with('success', 'Produk berhasil dinonaktifkan.');
    }

    public function restore(Product $product): RedirectResponse
    {
        $product->restore();

        return Redirect::route('products.index')
            ->with('success', 'Produk berhasil diaktifkan kembali.');
    }
}

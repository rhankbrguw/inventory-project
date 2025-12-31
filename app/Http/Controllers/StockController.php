<?php

namespace App\Http\Controllers;

use App\Http\Requests\AdjustStockRequest;
use App\Http\Resources\InventoryResource;
use App\Http\Resources\ProductResource;
use App\Http\Resources\StockMovementResource;
use App\Models\Inventory;
use App\Models\Location;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\Sell;
use App\Models\User;
use App\Models\StockMovement;
use App\Models\StockTransfer;
use App\Models\Type;
use App\Traits\ManagesStock;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class StockController extends Controller
{
    use ManagesStock;

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Inventory::class);

        $user = Auth::user();
        $accessibleLocationIds = $user->getAccessibleLocationIds();

        $inventories = Inventory::with(['product.type', 'location.type'])
            ->join('products', 'inventories.product_id', '=', 'products.id')
            ->select('inventories.*')
            ->whereHas('location', function ($query) {
                $query->whereNull('deleted_at');
            })
            ->whereHas('product', function ($query) {
                $query->whereNull('deleted_at');
            })
            ->when($accessibleLocationIds, function ($query) use ($accessibleLocationIds) {
                $query->whereIn('inventories.location_id', $accessibleLocationIds);
            })
            ->when($request->input('search'), function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('products.name', 'like', "%{$search}%")
                        ->orWhere('products.sku', 'like', "%{$search}%");
                });
            })
            ->when($request->input('location_id'), function ($query, $locationId) {
                $query->where('inventories.location_id', $locationId);
            })
            ->when($request->input('product_id'), function ($query, $productId) {
                $query->where('inventories.product_id', $productId);
            })
            ->when($request->input('type_id'), function ($query, $typeId) {
                $query->whereHas('product', function ($q) use ($typeId) {
                    $q->where('type_id', $typeId);
                });
            })
            ->when($request->input('sort'), function ($query, $sort) {
                match ($sort) {
                    'name_asc' => $query->orderBy('products.name', 'asc'),
                    'name_desc' => $query->orderBy('products.name', 'desc'),
                    'quantity_asc' => $query->orderBy('inventories.quantity', 'asc'),
                    'quantity_desc' => $query->orderBy('inventories.quantity', 'desc'),
                    'last_moved_desc' => $query->orderBy('inventories.updated_at', 'desc'),
                    'last_moved_asc' => $query->orderBy('inventories.updated_at', 'asc'),
                    'price_desc' => $query->orderBy('products.price', 'desc'),
                    'price_asc' => $query->orderBy('products.price', 'asc'),
                    default => $query->orderBy('products.name', 'asc'),
                };
            }, function ($query) {
                $query->orderBy('products.name', 'asc');
            })
            ->paginate(15)
            ->withQueryString();

        $locationsQuery = Location::orderBy('name');
        if ($accessibleLocationIds) {
            $locationsQuery->whereIn('id', $accessibleLocationIds);
        }

        $roleCode = $user->roles->first()?->code;
        $canAdjustStock = $user->level === 1 || in_array($roleCode, ['WHM', 'BRM', 'STF']);

        return Inertia::render('Stock/Index', [
            'inventories' => InventoryResource::collection($inventories),
            'locations' => $locationsQuery->get(['id', 'name']),
            'products' => Product::orderBy('name')->get(['id', 'name', 'sku']),
            'productTypes' => Type::where('group', Type::GROUP_PRODUCT)->get(['id', 'name']),
            'filters' => (object) $request->only(['search', 'location_id', 'type_id', 'sort', 'product_id']),
            'canAdjustStock' => $canAdjustStock,
        ]);
    }

    public function show(Inventory $inventory): Response
    {
        $this->authorize('view', $inventory);

        $user = Auth::user();
        $accessibleLocationIds = $user->getAccessibleLocationIds();
        if ($accessibleLocationIds && !in_array($inventory->location_id, $accessibleLocationIds)) {
            abort(403, 'Anda tidak memiliki akses ke stok lokasi ini.');
        }

        $inventory->load(['product.type', 'location.type']);

        $stockMovements = StockMovement::where('product_id', $inventory->product_id)
            ->where('location_id', $inventory->location_id)
            ->with([
                'product',
                'location',
                'reference' => function (MorphTo $morphTo) {
                    $morphTo->morphWith([
                        Purchase::class => ['supplier'],
                        Sell::class => ['customer'],
                        StockTransfer::class => ['fromLocation', 'toLocation'],
                        User::class => [],
                    ]);
                }
            ])
            ->latest('created_at')
            ->paginate(20);

        return Inertia::render('Stock/Show', [
            'inventory' => InventoryResource::make($inventory),
            'stockMovements' => StockMovementResource::collection($stockMovements),
        ]);
    }

    public function showAdjustForm(): Response
    {
        $user = Auth::user();
        $accessibleLocationIds = $user->getAccessibleLocationIds();

        $productsQuery = Product::orderBy('name');

        if ($accessibleLocationIds) {
            $productsQuery->whereHas('inventories', function ($q) use ($accessibleLocationIds) {
                $q->whereIn('location_id', $accessibleLocationIds);
            });
        }

        $productsData = $productsQuery->get();

        $locationsQuery = Location::orderBy('name');
        if ($accessibleLocationIds) {
            $locationsQuery->whereIn('id', $accessibleLocationIds);
        }
        $locationsData = $locationsQuery->get(['id', 'name']);

        return Inertia::render('Stock/Adjust', [
            'products' => ProductResource::collection($productsData),
            'locations' => $locationsData,
            'adjustmentReasons' => [
                ['value' => 'Stock Opname', 'label' => 'Penyesuaian Stok Fisik'],
                ['value' => 'Rusak', 'label' => 'Barang Rusak'],
                ['value' => 'Retur', 'label' => 'Barang Retur'],
            ],
        ]);
    }

    public function adjust(AdjustStockRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $this->authorize('adjust', [Inventory::class, $validated['location_id']]);

        $user = $request->user();
        $accessibleLocationIds = $user->getAccessibleLocationIds();
        if ($accessibleLocationIds && !in_array($validated['location_id'], $accessibleLocationIds)) {
            abort(403, 'Anda tidak memiliki akses ke lokasi ini.');
        }

        try {
            DB::transaction(function () use ($validated, $user) {
                Product::findOrFail($validated['product_id']);

                $inventory = Inventory::lockForUpdate()->firstOrCreate(
                    ['product_id' => $validated['product_id'], 'location_id' => $validated['location_id']],
                    ['quantity' => 0, 'average_cost' => 0]
                );

                $currentQuantity = (float) $inventory->quantity;
                $newQuantity = (float) $validated['quantity'];
                $quantityDifference = $newQuantity - $currentQuantity;

                if ($quantityDifference == 0) {
                    return;
                }

                $inventory->update(['quantity' => $newQuantity]);

                StockMovement::create([
                    'product_id' => $validated['product_id'],
                    'location_id' => $validated['location_id'],
                    'type' => 'adjustment',
                    'quantity' => $quantityDifference,
                    'cost_per_unit' => $inventory->average_cost,
                    'average_cost_per_unit' => $inventory->average_cost,
                    'reference_type' => User::class,
                    'reference_id' => $user->id,
                    'notes' => $validated['notes'] . " (Opname: {$currentQuantity} -> {$newQuantity})",
                    'user_id' => $user->id,
                ]);
            });
        } catch (\Exception $e) {
            return Redirect::back()->with('error', 'Gagal menyesuaikan stok: ' . $e->getMessage())->withInput();
        }

        return Redirect::route('stock.index')
            ->with('success', 'Stok berhasil disesuaikan dengan jumlah fisik.');
    }

    public function getQuantity(Request $request): JsonResponse
    {
        $request->validate([
            'product_id' => ['required', 'exists:products,id'],
            'location_id' => ['required', 'exists:locations,id'],
        ]);

        $inventory = Inventory::where('product_id', $request->product_id)
            ->where('location_id', $request->location_id)
            ->first();

        return response()->json([
            'quantity' => $inventory->quantity ?? 0,
        ]);
    }
}

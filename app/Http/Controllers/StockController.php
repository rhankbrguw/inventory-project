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
use App\Models\StockMovement;
use App\Models\StockTransfer;
use App\Models\Type;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class StockController extends Controller
{
    public function index(Request $request): Response
    {
        $inventories = Inventory::with(['product.type', 'location'])
            ->join('products', 'inventories.product_id', '=', 'products.id')
            ->select('inventories.*')
            ->whereHas('location', function ($query) {
                $query->whereNull('deleted_at');
            })
            ->whereHas('product', function ($query) {
                $query->whereNull('deleted_at');
            })
            ->when($request->input('search'), function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q
                        ->where('products.name', 'like', "%{$search}%")
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
                    default => $query->orderBy('products.name', 'asc'),
                };
            }, function ($query) {
                $query->orderBy('products.name', 'asc');
            })
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Stock/Index', [
            'inventories' => InventoryResource::collection($inventories),
            'locations' => Location::orderBy('name')->get(['id', 'name']),
            'products' => Product::orderBy('name')->get(['id', 'name', 'sku']),
            'productTypes' => Type::where('group', Type::GROUP_PRODUCT)->get(['id', 'name']),
            'filters' => (object) $request->only(['search', 'location_id', 'type_id', 'sort', 'product_id']),
        ]);
    }

    public function show(Inventory $inventory): Response
    {
        $inventory->load(['product.type', 'location']);

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
        $productsData = Product::orderBy('name')->get();
        $locationsData = Location::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Stock/Adjust', [
            'products' => ProductResource::collection($productsData),
            'locations' => $locationsData,
            'adjustmentReasons' => [
                ['value' => 'Rusak', 'label' => 'Barang Rusak'],
                ['value' => 'Retur', 'label' => 'Barang Retur'],
            ],
        ]);
    }


    public function adjust(AdjustStockRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $quantityToRemove = (float) $validated['quantity'];

        if ($quantityToRemove <= 0) {
            return Redirect::back()->withErrors(['quantity' => 'Jumlah yang disesuaikan harus lebih besar dari 0.'])->withInput();
        }

        try {
            DB::transaction(function () use ($validated, $quantityToRemove) {
                $inventory = Inventory::where('product_id', $validated['product_id'])
                    ->where('location_id', $validated['location_id'])
                    ->lockForUpdate()
                    ->first();

                if (!$inventory || $inventory->quantity < $quantityToRemove) {
                    throw new \Exception('Stok tidak mencukupi untuk penyesuaian.');
                }

                $quantityChange = -$quantityToRemove;

                StockMovement::create([
                    'product_id' => $validated['product_id'],
                    'location_id' => $validated['location_id'],
                    'type' => 'adjustment',
                    'quantity' => $quantityChange,
                    'cost_per_unit' => $inventory->average_cost,
                    'notes' => $validated['notes'] ?? null,
                ]);

                $inventory->decrement('quantity', $quantityToRemove);
            });
        } catch (\Exception $e) {
            return Redirect::back()->with('error', 'Gagal menyesuaikan stok: ' . $e->getMessage())->withInput();
        }

        return Redirect::route('stock.index')
            ->with('success', 'Stok berhasil disesuaikan.');
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

<?php

namespace App\Http\Controllers;

use App\Http\Requests\AdjustStockRequest;
use App\Http\Resources\InventoryResource;
use App\Http\Resources\Transaction\StockMovementResource;
use App\Models\Inventory;
use App\Models\Location;
use App\Models\Product;
use App\Models\StockMovement;
use App\Models\Type;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class StockController extends Controller
{
   public function index(Request $request)
   {
      $inventories = Inventory::with(['product.type', 'location'])
         ->join('products', 'inventories.product_id', '=', 'products.id')
         ->select('inventories.*')
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
            if ($sort === 'name_asc') $query->orderBy('products.name', 'asc');
            if ($sort === 'name_desc') $query->orderBy('products.name', 'desc');
            if ($sort === 'quantity_asc') $query->orderBy('inventories.quantity', 'asc');
            if ($sort === 'quantity_desc') $query->orderBy('inventories.quantity', 'desc');
            if ($sort === 'last_moved_desc') $query->orderBy('inventories.updated_at', 'desc');
            if ($sort === 'last_moved_asc') $query->orderBy('inventories.updated_at', 'asc');
         }, function ($query) {
            $query->orderBy('products.name', 'asc');
         })
         ->paginate(15)
         ->withQueryString();

      return Inertia::render('Stock/Index', [
         'inventories' => InventoryResource::collection($inventories),
         'locations' => Location::all(),
         'products' => Product::orderBy('name')->get(['id', 'name', 'sku']),
         'productTypes' => Type::where('group', 'product_type')->get(),
         'filters' => (object) $request->only(['search', 'location_id', 'type_id', 'sort', 'product_id']),
      ]);
   }

   public function show(Inventory $inventory)
   {
      $inventory->load(['product', 'location']);

      $stockMovements = StockMovement::where('product_id', $inventory->product_id)
         ->where('location_id', $inventory->location_id)
         ->with('purchase')
         ->latest('created_at')
         ->paginate(20);

      return Inertia::render('Stock/Show', [
         'inventory' => $inventory,
         'stockMovements' => StockMovementResource::collection($stockMovements),
      ]);
   }

   public function showAdjustForm()
   {
      return Inertia::render('Stock/Adjust', [
         'products' => Product::orderBy('name')->get(['id', 'name', 'sku']),
         'locations' => Location::orderBy('name')->get(['id', 'name']),
      ]);
   }

   public function adjust(AdjustStockRequest $request)
   {
      $validated = $request->validated();

      DB::transaction(function () use ($validated) {
         $inventory = Inventory::firstOrCreate(
            ['product_id' => $validated['product_id'], 'location_id' => $validated['location_id']],
            ['quantity' => 0, 'average_cost' => 0]
         );

         $currentQuantity = $inventory->quantity;
         $newQuantity = $validated['quantity'];
         $quantityChange = $newQuantity - $currentQuantity;

         if ($quantityChange != 0) {
            StockMovement::create([
               'product_id' => $validated['product_id'],
               'location_id' => $validated['location_id'],
               'type' => 'adjustment',
               'quantity' => $quantityChange,
               'cost_per_unit' => $inventory->average_cost,
               'notes' => $validated['notes'],
            ]);

            $inventory->update(['quantity' => $newQuantity]);
         }
      });

      return Redirect::route('stock.index')->with('success', 'Stok berhasil disesuaikan.');
   }

   public function getQuantity(Request $request): JsonResponse
   {
      $request->validate([
         'product_id' => 'required|exists:products,id',
         'location_id' => 'required|exists:locations,id',
      ]);

      $inventory = Inventory::where('product_id', $request->product_id)
         ->where('location_id', $request->location_id)
         ->first();

      return response()->json([
         'quantity' => $inventory->quantity ?? 0,
      ]);
   }
}

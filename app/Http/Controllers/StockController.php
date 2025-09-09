<?php

namespace App\Http\Controllers;

use App\Http\Resources\ProductResource;
use App\Models\Inventory;
use App\Models\Location;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StockController extends Controller
{
   public function index(Request $request)
   {
      $query = Product::query()->with(['inventories.location']);

      $query->when($request->input('search'), function ($q, $search) {
         $q->where(function ($inner_q) use ($search) {
            $inner_q->where('name', 'like', "%{$search}%")
               ->orWhere('sku', 'like', "%{$search}%");
         });
      });

      $query->when($request->input('location_id'), function ($q, $location_id) {
         $q->whereHas('inventories', fn($inv_q) => $inv_q->where('location_id', $location_id));
      });

      $query->orderBy(
         $request->input('sort_by', 'created_at'),
         $request->input('sort_direction', 'desc')
      );

      $rawMaterials = (clone $query)->where('type', 'raw_material')
         ->paginate(10, ['*'], 'raw_materials_page')
         ->withQueryString();

      $finishedGoods = (clone $query)->where('type', 'finished_good')
         ->paginate(10, ['*'], 'finished_goods_page')
         ->withQueryString();

      return Inertia::render('Stock/Index', [
         'rawMaterials' => ProductResource::collection($rawMaterials),
         'finishedGoods' => ProductResource::collection($finishedGoods),
         'locations' => Location::all(['id', 'name']),
         'filters' => $request->only(['search', 'location_id', 'sort_by', 'sort_direction']),
      ]);
   }

   public function showAdjustForm()
   {
      return Inertia::render('Stock/Adjust', [
         'products' => Product::orderBy('name')->get(['id', 'name', 'sku']),
         'locations' => Location::orderBy('name')->get(['id', 'name', 'type']),
      ]);
   }

   public function adjust(Request $request)
   {
      $request->validate([
         'product_id' => 'required|integer|exists:products,id',
         'location_id' => 'required|integer|exists:locations,id',
         'quantity' => 'required|integer|min:0',
      ]);

      Inventory::updateOrCreate(
         ['product_id' => $request->product_id, 'location_id' => $request->location_id],
         ['quantity' => $request->quantity]
      );

      return to_route('stock.index')->with('success', 'Stok berhasil disesuaikan.');
   }
}

<?php

namespace App\Http\Controllers\Transaction;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePurchaseRequest;
use App\Http\Resources\Transaction\PurchaseResource;
use App\Models\Inventory;
use App\Models\Location;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\StockMovement;
use App\Models\Supplier;
use Illuminate\Support\Facades\DB;

class PurchaseController extends Controller
{
   public function create()
   {
      return inertia('Transactions/Purchases/Create', [
         'locations' => Location::all(['id', 'name']),
         'suppliers' => Supplier::all(['id', 'name']),
         'products' => Product::all(['id', 'name', 'sku', 'unit']),
      ]);
   }

   public function store(StorePurchaseRequest $request)
   {
      $validated = $request->validated();
      $totalCost = 0;

      foreach ($validated['items'] as $item) {
         $totalCost += $item['quantity'] * $item['cost_per_unit'];
      }

      DB::transaction(function () use ($validated, $totalCost) {
         $purchase = Purchase::create([
            'location_id' => $validated['location_id'],
            'supplier_id' => $validated['supplier_id'],
            'user_id' => auth()->id(),
            'reference_code' => 'PO-' . now()->format('Ymd-His'),
            'transaction_date' => $validated['transaction_date'],
            'notes' => $validated['notes'],
            'status' => 'completed',
            'total_cost' => $totalCost,
         ]);

         foreach ($validated['items'] as $item) {
            StockMovement::create([
               'purchase_id' => $purchase->id,
               'product_id' => $item['product_id'],
               'location_id' => $validated['location_id'],
               'type' => 'purchase',
               'quantity' => $item['quantity'],
               'cost_per_unit' => $item['cost_per_unit'],
            ]);

            $inventory = Inventory::firstOrNew([
               'product_id' => $item['product_id'],
               'location_id' => $validated['location_id'],
            ]);

            $oldQty = $inventory->quantity ?? 0;
            $oldAvgCost = $inventory->average_cost ?? 0;
            $newQty = $item['quantity'];
            $newCost = $item['cost_per_unit'];

            $newTotalQty = $oldQty + $newQty;
            $newAvgCost = (($oldQty * $oldAvgCost) + ($newQty * $newCost)) / $newTotalQty;

            $inventory->quantity = $newTotalQty;
            $inventory->average_cost = $newAvgCost;
            $inventory->save();
         }
      });

      return redirect()->route('transactions.index')->with('success', 'Transaksi pembelian berhasil disimpan.');
   }

   public function show(Purchase $purchase)
   {
      $purchase->load(['location', 'supplier', 'user', 'stockMovements.product']);

      return inertia('Transactions/Purchases/Show', [
         'purchase' => PurchaseResource::make($purchase)
      ]);
   }
}

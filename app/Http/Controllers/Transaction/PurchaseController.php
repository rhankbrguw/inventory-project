<?php

namespace App\Http\Controllers\Transaction;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePurchaseRequest;
use App\Http\Resources\Transaction\PurchaseResource;
use App\Models\Inventory;
use App\Models\Location;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\Supplier;
use App\Models\Type;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class PurchaseController extends Controller
{
    public function show(Purchase $purchase): Response
    {
        return Inertia::render('Transactions/Purchases/Show', [
            'purchase' => PurchaseResource::make(
                $purchase->load(['location', 'supplier', 'user', 'stockMovements.product', 'paymentMethodType', 'type'])
            ),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Transactions/Purchases/Create', [
            'locations' => Location::orderBy('name')->get(['id', 'name']),
            'suppliers' => Supplier::orderBy('name')->get(['id', 'name']),
            'products' => Product::with('defaultSupplier')->orderBy('name')->get(),
            'paymentMethods' => Type::where('group', Type::GROUP_PAYMENT)
                ->orderBy('name')
                ->get(['id', 'name']),
        ]);
    }

    public function store(StorePurchaseRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $totalCost = collect($validated['items'])->sum(function ($item) {
            return $item['quantity'] * $item['cost_per_unit'];
        });

        $purchaseType = Type::where('group', Type::GROUP_TRANSACTION)
            ->where('name', 'Pembelian')
            ->firstOrFail();

        DB::transaction(function () use ($validated, $totalCost, $purchaseType) {
            $purchase = Purchase::create([
                'type_id' => $purchaseType->id,
                'location_id' => $validated['location_id'],
                'supplier_id' => $validated['supplier_id'],
                'user_id' => auth()->id(),
                'reference_code' => 'PO-' . now()->format('Ymd-His'),
                'transaction_date' => Carbon::parse($validated['transaction_date'])->format('Y-m-d'),
                'notes' => $validated['notes'],
                'payment_method_type_id' => $validated['payment_method_type_id'] ?? null,
                'status' => 'completed',
                'total_cost' => $totalCost,
            ]);

            foreach ($validated['items'] as $item) {
                $purchase->stockMovements()->create([
                    'product_id' => $item['product_id'],
                    'supplier_id' => $validated['supplier_id'],
                    'location_id' => $validated['location_id'],
                    'type' => 'purchase',
                    'quantity' => $item['quantity'],
                    'cost_per_unit' => $item['cost_per_unit'],
                    'notes' => $validated['notes'],
                ]);

                $inventory = Inventory::firstOrCreate(
                    [
                        'product_id' => $item['product_id'],
                        'location_id' => $validated['location_id']
                    ],
                    ['quantity' => 0, 'average_cost' => 0]
                );

                $oldQty = $inventory->quantity;
                $oldAvgCost = $inventory->average_cost;
                $newQty = $item['quantity'];
                $newCost = $item['cost_per_unit'];

                $newTotalQty = $oldQty + $newQty;
                $newAvgCost = (($oldQty * $oldAvgCost) + ($newQty * $newCost))
                    / ($newTotalQty > 0 ? $newTotalQty : 1);

                $inventory->update([
                    'quantity' => $newTotalQty,
                    'average_cost' => $newAvgCost,
                ]);
            }
        });

        return Redirect::route('transactions.index')
            ->with('success', 'Transaksi pembelian berhasil disimpan.');
    }
}

<?php

namespace App\Http\Controllers\Transaction;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreStockTransferRequest;
use App\Models\Inventory;
use App\Models\Location;
use App\Models\Product;
use App\Models\StockTransfer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;
use Inertia\Response;

class StockTransferController extends Controller
{
    public function create(): Response
    {
        return inertia('Transactions/Transfers/Create', [
            'locations' => Location::orderBy('name')->get(['id', 'name']),
            'products' => Product::orderBy('name')->get(),
        ]);
    }

    public function store(StoreStockTransferRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        DB::transaction(function () use ($validated, $request) {
            $transfer = StockTransfer::create([
                'reference_code' => 'TRF-' . now()->format('Ymd-His'),
                'from_location_id' => $validated['from_location_id'],
                'to_location_id' => $validated['to_location_id'],
                'user_id' => $request->user()->id,
                'transfer_date' => Carbon::parse($validated['transfer_date'])->format('Y-m-d'),
                'notes' => $validated['notes'],
                'status' => 'completed',
            ]);

            foreach ($validated['items'] as $item) {
                $transfer->stockMovements()->create([
                    'product_id' => $item['product_id'],
                    'location_id' => $validated['from_location_id'],
                    'user_id' => $request->user()->id,
                    'type' => 'transfer_out',
                    'quantity' => -abs($item['quantity']),
                ]);

                $transfer->stockMovements()->create([
                    'product_id' => $item['product_id'],
                    'location_id' => $validated['to_location_id'],
                    'user_id' => $request->user()->id,
                    'type' => 'transfer_in',
                    'quantity' => abs($item['quantity']),
                ]);

                Inventory::where('product_id', $item['product_id'])
                    ->where('location_id', $validated['from_location_id'])
                    ->decrement('quantity', $item['quantity']);

                Inventory::where('product_id', $item['product_id'])
                    ->where('location_id', $validated['to_location_id'])
                    ->increment('quantity', $item['quantity']);
            }
        });

        return redirect()
            ->route('stock-movements.index')
            ->with('success', 'Transfer stok berhasil dicatat.');
    }
}

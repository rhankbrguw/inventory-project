<?php

namespace App\Http\Controllers\Transaction;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSellRequest;
use App\Http\Resources\Transaction\SellResource;
use App\Http\Resources\CustomerResource;
use App\Http\Resources\LocationResource;
use App\Http\Resources\ProductResource;
use App\Http\Resources\TypeResource;
use App\Models\Customer;
use App\Models\Inventory;
use App\Models\Location;
use App\Models\Product;
use App\Models\Sell;
use App\Models\StockMovement;
use App\Models\Type;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class SellController extends Controller
{
    public function create(): Response
    {
        $locations = Location::orderBy('name')->get(['id', 'name']);
        $customers = Customer::orderBy('name')->get(['id', 'name']);
        $products = Product::whereNull('deleted_at')->orderBy('name')->get(['id', 'name', 'sku', 'unit', 'price']);
        $paymentMethods = Type::where('group', Type::GROUP_PAYMENT)->orderBy('name')->get(['id', 'name']);

        return Inertia::render('Transactions/Sells/Create', [
            'locations' => $locations,
            'customers' => $customers,
            'allProducts' => $products,
            'paymentMethods' => $paymentMethods,
        ]);
    }

    public function store(StoreSellRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $itemsData = $validated['items'];

        try {
            DB::transaction(function () use ($validated, $itemsData, $request) {
                $totalPrice = collect($itemsData)->sum(function ($item) {
                    return (float) $item['quantity'] * (float) $item['sell_price'];
                });

                $referenceCode = 'SL-' . now()->format('Ymd') . '-' . strtoupper(Str::random(4));
                while (Sell::where('reference_code', $referenceCode)->exists()) {
                    $referenceCode = 'SL-' . now()->format('Ymd') . '-' . strtoupper(Str::random(4));
                }

                $sell = Sell::create([
                    'type_id' => $validated['type_id'],
                    'location_id' => $validated['location_id'],
                    'customer_id' => $validated['customer_id'],
                    'user_id' => $request->user()->id,
                    'reference_code' => $referenceCode,
                    'transaction_date' => $validated['transaction_date'],
                    'total_price' => $totalPrice,
                    'status' => $validated['status'],
                    'payment_method_type_id' => $validated['payment_method_type_id'],
                    'notes' => $validated['notes'],
                ]);

                foreach ($itemsData as $item) {
                    $product = Product::find($item['product_id']);
                    $inventory = Inventory::where('product_id', $item['product_id'])
                        ->where('location_id', $validated['location_id'])
                        ->firstOrFail();

                    $sell->stockMovements()->create([
                        'product_id' => $item['product_id'],
                        'location_id' => $validated['location_id'],
                        'type' => 'sell',
                        'quantity' => -(float) $item['quantity'],
                        'cost_per_unit' => (float) $item['sell_price'],
                        'customer_id' => $validated['customer_id'],
                        'notes' => $validated['notes'],
                    ]);

                    $inventory->decrement('quantity', (float) $item['quantity']);
                }
            });
        } catch (\Exception $e) {
            return Redirect::back()->with('error', 'Gagal menyimpan penjualan: ' . $e->getMessage());
        }

        return Redirect::route('transactions.index')->with('success', 'Penjualan berhasil disimpan.');
    }

    public function show(Sell $sell): Response
    {
        $sell->load(['location', 'customer', 'user', 'paymentMethod', 'stockMovements.product', 'type']);

        return Inertia::render('Transactions/Sells/Show', [
            'sell' => SellResource::make($sell),
        ]);
    }
}

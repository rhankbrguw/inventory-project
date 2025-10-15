<?php

namespace App\Http\Controllers\Transaction;

use App\Http\Controllers\Controller;
use App\Http\Resources\Transaction\StockMovementResource;
use App\Http\Resources\ProductResource;
use App\Models\Location;
use App\Models\Product;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Inertia\Response;

class StockMovementController extends Controller
{
    public function index(Request $request): Response
    {
        $stockMovements = StockMovement::with(['product', 'location', 'user', 'reference'])
            ->when($request->input('search'), function ($query, $search) {
                $query->whereHas('product', function ($q) use ($search) {
                    $q
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('sku', 'like', "%{$search}%");
                });
            })
            ->when($request->input('location_id'), function ($query, $locationId) {
                if ($locationId !== 'all') {
                    $query->where('location_id', $locationId);
                }
            })
            ->when($request->input('product_id'), function ($query, $productId) {
                if ($productId) {
                    $query->where('product_id', $productId);
                }
            })
            ->when($request->input('type'), function ($query, $type) {
                if ($type !== 'all') {
                    $query->where('type', $type);
                }
            })
            ->latest('created_at')
            ->paginate(20)
            ->withQueryString();

        return inertia('Transactions/StockMovements/Index', [
            'stockMovements' => StockMovementResource::collection($stockMovements),
            'locations' => Location::orderBy('name')->get(['id', 'name']),
            'products' => ProductResource::collection(Product::orderBy('name')->get()),
            'movementTypes' => StockMovement::getMovementTypes(),
            'filters' => (object) $request->only(['search', 'location_id', 'product_id', 'type']),
        ]);
    }
}

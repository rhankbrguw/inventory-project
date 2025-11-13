<?php

namespace App\Http\Controllers;

use App\Http\Resources\StockMovementResource;
use App\Models\Inventory;
use App\Models\Purchase;
use App\Models\Sell;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = Auth::user();
        $locationIds = $user->getAccessibleLocationIds();

        $totalSalesToday = Sell::query()
            ->when($locationIds, function ($query) use ($locationIds) {
                $query->whereIn('location_id', $locationIds);
            })
            ->whereDate('transaction_date', today())
            ->sum('total_price');

        $totalPurchasesToday = Purchase::query()
            ->when($locationIds, function ($query) use ($locationIds) {
                $query->whereIn('location_id', $locationIds);
            })
            ->whereDate('transaction_date', today())
            ->sum('total_cost');

        $totalInventoryValue = Inventory::query()
            ->when($locationIds, function ($query) use ($locationIds) {
                $query->whereIn('location_id', $locationIds);
            })
            ->select(DB::raw('SUM(quantity * average_cost) as total_value'))
            ->first()
            ->total_value ?? 0;

        $lowStockItemsCount = Inventory::query()
            ->when($locationIds, function ($query) use ($locationIds) {
                $query->whereIn('location_id', $locationIds);
            })
            ->where('quantity', '>', 0)
            ->where('quantity', '<=', 10)
            ->count();

        $recentMovements = StockMovement::with(['product', 'location'])
            ->when($locationIds, function ($query) use ($locationIds) {
                $query->whereIn('location_id', $locationIds);
            })
            ->latest()
            ->limit(5)
            ->get();

        return Inertia::render('Dashboard', [
            'stats' => [
                'total_sales_today' => $totalSalesToday,
                'total_purchases_today' => $totalPurchasesToday,
                'total_inventory_value' => $totalInventoryValue,
                'low_stock_items_count' => $lowStockItemsCount,
            ],
            'recentMovements' => StockMovementResource::collection($recentMovements),
        ]);
    }
}

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
use Illuminate\Support\Carbon;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = Auth::user();
        $accessibleLocationIds = $user->getAccessibleLocationIds();

        $stats = $this->getDashboardStats($accessibleLocationIds);
        $recentMovements = $this->getRecentMovements($accessibleLocationIds);

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'recentMovements' => StockMovementResource::collection($recentMovements),
        ]);
    }

    private function getDashboardStats(?array $locationIds): array
    {
        $today = Carbon::today();

        $salesToday = Sell::query()
            ->when($locationIds, function ($query) use ($locationIds) {
                $query->whereIn('location_id', $locationIds);
            })
            ->whereDate('transaction_date', $today)
            ->sum('total_price');

        $purchasesToday = Purchase::query()
            ->when($locationIds, function ($query) use ($locationIds) {
                $query->whereIn('location_id', $locationIds);
            })
            ->whereDate('transaction_date', $today)
            ->sum('total_cost');

        $inventoryValue = Inventory::query()
            ->when($locationIds, function ($query) use ($locationIds) {
                $query->whereIn('location_id', $locationIds);
            })
            ->select(DB::raw('SUM(quantity * average_cost) as total_value'))
            ->value('total_value');

        $lowStockItems = Inventory::query()
            ->when($locationIds, function ($query) use ($locationIds) {
                $query->whereIn('location_id', $locationIds);
            })
            ->where('quantity', '<=', 5)
            ->where('quantity', '>', 0)
            ->count();

        return [
            'total_sales_today' => $salesToday,
            'total_purchases_today' => $purchasesToday,
            'total_inventory_value' => $inventoryValue,
            'low_stock_items_count' => $lowStockItems,
        ];
    }

    private function getRecentMovements(?array $locationIds)
    {
        return StockMovement::with(['product', 'location', 'reference'])
            ->when($locationIds, function ($query) use ($locationIds) {
                $query->whereIn('location_id', $locationIds);
            })
            ->latest('created_at')
            ->take(5)
            ->get();
    }
}

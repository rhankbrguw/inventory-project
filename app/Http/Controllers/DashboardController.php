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
        $yesterday = Carbon::yesterday();

        $salesToday = Sell::accessibleBy($locationIds)
            ->whereDate('transaction_date', $today)
            ->sum('total_price');

        $salesYesterday = Sell::accessibleBy($locationIds)
            ->whereDate('transaction_date', $yesterday)
            ->sum('total_price');

        $purchasesToday = Purchase::accessibleBy($locationIds)
            ->whereDate('transaction_date', $today)
            ->sum('total_cost');

        $purchasesYesterday = Purchase::accessibleBy($locationIds)
            ->whereDate('transaction_date', $yesterday)
            ->sum('total_cost');

        $inventoryValue = Inventory::accessibleBy($locationIds)
            ->select(DB::raw('SUM(quantity * average_cost) as total_value'))
            ->value('total_value') ?? 0;

        $lowStockItems = Inventory::accessibleBy($locationIds)
            ->where('quantity', '<=', 5)
            ->where('quantity', '>', 0)
            ->count();

        return [
            'total_sales_today' => $salesToday,
            'sales_trend' => $this->calculateTrend($salesToday, $salesYesterday),
            'total_purchases_today' => $purchasesToday,
            'purchases_trend' => $this->calculateTrend($purchasesToday, $purchasesYesterday),
            'total_inventory_value' => $inventoryValue,
            'low_stock_items_count' => $lowStockItems,
        ];
    }

    private function getRecentMovements(?array $locationIds)
    {
        return StockMovement::with(['product', 'location', 'reference'])
            ->accessibleBy($locationIds)
            ->latest('created_at')
            ->take(5)
            ->get();
    }

    private function calculateTrend(float $current, float $previous): float
    {
        if ($previous == 0) {
            return $current > 0 ? 100 : 0;
        }

        return round((($current - $previous) / $previous) * 100, 1);
    }
}

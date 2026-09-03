<?php

namespace App\Services;

use App\Models\Inventory;
use App\Models\Purchase;
use App\Models\Sell;
use App\Models\StockMovement;
use App\Models\StockTransfer;
use App\Models\User;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class DashboardService
{
    public function __construct(protected DashboardChartService $chartService) {}

    public function getDashboardPayload(?array $filterIds, array $dateConfig): array
    {
        $cacheKey = 'dash_bundle_'.md5(json_encode($filterIds).json_encode($dateConfig));

        return Cache::remember($cacheKey, 300, fn () => [
            'stats' => $this->calculateStats($filterIds, $dateConfig),
            'charts' => [
                'sales' => $this->chartService->getSalesChart($filterIds, $dateConfig),
                'purchases' => $this->chartService->getPurchasesChart($filterIds, $dateConfig),
                'channels' => $this->chartService->getPaymentChannelChart($filterIds, $dateConfig),
                'top_items' => $this->chartService->getTopSellingItems($filterIds, $dateConfig),
                'comparison' => $this->chartService->getSalesPurchaseComparison($filterIds, $dateConfig),
            ],
        ]);
    }

    public function getStats(?array $locationIds, array $dateConfig): array
    {
        $cacheKey = 'dashboard_stats_'.md5(json_encode($locationIds).json_encode($dateConfig));

        return Cache::remember($cacheKey, 600, fn () => $this->calculateStats($locationIds, $dateConfig));
    }

    private function calculateStats(?array $locationIds, array $dateConfig): array
    {
        $start = $dateConfig['start'];
        $end = $dateConfig['end'];

        $revenue = Sell::accessibleBy($locationIds)->where('status', Sell::STATUS_COMPLETED)->whereBetween('transaction_date', [$start, $end])->sum('total_price');
        $cogs = StockMovement::whereHasMorph('reference', [Sell::class], fn ($q) => $q->accessibleBy($locationIds)->where('status', Sell::STATUS_COMPLETED)->whereBetween('transaction_date', [$start, $end]))->sum(DB::raw('ABS(quantity) * average_cost_per_unit'));
        $totalPurchases = Purchase::accessibleBy($locationIds)->where('status', Purchase::STATUS_COMPLETED)->whereBetween('transaction_date', [$start, $end])->sum('total_cost');
        $inventoryValue = Inventory::accessibleBy($locationIds)->sum(DB::raw('quantity * average_cost'));
        $lowStockCount = Inventory::accessibleBy($locationIds)->where('quantity', '<=', config('inventory.low_stock_threshold', 20))->where('quantity', '>', 0)->count();

        return [
            'revenue' => (float) $revenue,
            'net_profit' => (float) ($revenue - $cogs),
            'total_purchases' => (float) $totalPurchases,
            'inventory_value' => round((float) $inventoryValue, 2),
            'low_stock_count' => $lowStockCount,
            'sales_count' => Sell::accessibleBy($locationIds)->where('status', Sell::STATUS_COMPLETED)->whereBetween('transaction_date', [$start, $end])->count(),
            'purchase_count' => Purchase::accessibleBy($locationIds)->where('status', Purchase::STATUS_COMPLETED)->whereBetween('transaction_date', [$start, $end])->count(),
            'gross_margin' => $revenue > 0 ? (($revenue - $cogs) / $revenue) * 100 : 0,
        ];
    }

    public function getSalesChart(?array $locationIds, array $dateConfig): array
    {
        $key = 'dash_sales_'.md5(json_encode($locationIds).json_encode($dateConfig));

        return Cache::remember($key, 600, fn () => $this->chartService->getSalesChart($locationIds, $dateConfig));
    }

    public function getPurchasesChart(?array $locationIds, array $dateConfig): array
    {
        $key = 'dash_purchases_'.md5(json_encode($locationIds).json_encode($dateConfig));

        return Cache::remember($key, 600, fn () => $this->chartService->getPurchasesChart($locationIds, $dateConfig));
    }

    public function getSalesPurchaseComparison(?array $locationIds, array $dateConfig): array
    {
        $key = 'dash_comparison_'.md5(json_encode($locationIds).json_encode($dateConfig));

        return Cache::remember($key, 600, fn () => $this->chartService->getSalesPurchaseComparison($locationIds, $dateConfig));
    }

    public function getPaymentChannelChart(?array $locationIds, array $dateConfig): array
    {
        $key = 'dash_channels_'.md5(json_encode($locationIds).json_encode($dateConfig));

        return Cache::remember($key, 600, fn () => $this->chartService->getPaymentChannelChart($locationIds, $dateConfig));
    }

    public function getTopSellingItems(?array $locationIds, array $dateConfig): array
    {
        $key = 'dash_top_items_'.md5(json_encode($locationIds).json_encode($dateConfig));

        return Cache::remember($key, 600, fn () => $this->chartService->getTopSellingItems($locationIds, $dateConfig));
    }

    public function getRecentMovements(?array $locationIds)
    {
        $key = 'dash_recent_movements_'.md5(json_encode($locationIds));

        return Cache::remember($key, 60, fn () => StockMovement::with([
            'product', 'location',
            'reference' => fn (MorphTo $m) => $m->morphWith([
                Purchase::class => ['supplier', 'fromLocation', 'location'],
                Sell::class => ['customer', 'targetLocation', 'location'],
                StockTransfer::class => ['fromLocation', 'toLocation'],
                User::class => [],
            ]),
        ])
            ->accessibleBy($locationIds)
            ->latest('created_at')
            ->take(6)
            ->get());
    }
}

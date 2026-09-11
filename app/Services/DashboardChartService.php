<?php

namespace App\Services;

use App\Models\Purchase;
use App\Models\Sell;
use App\Models\StockMovement;
use Illuminate\Support\Carbon;

class DashboardChartService
{
    public function getSalesChart(?array $locationIds, array $dateConfig): array
    {
        $sales = Sell::accessibleBy($locationIds)
            ->where('status', Sell::STATUS_COMPLETED)
            ->whereBetween('transaction_date', [$dateConfig['start'], $dateConfig['end']])
            ->selectRaw('DATE(transaction_date) as date, SUM(total_price) as total')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return $sales->map(fn ($s) => ['date' => Carbon::parse($s->date)->format('d M'), 'total' => (float) $s->total])->toArray();
    }

    public function getPurchasesChart(?array $locationIds, array $dateConfig): array
    {
        $purchases = Purchase::accessibleBy($locationIds)
            ->where('status', Purchase::STATUS_COMPLETED)
            ->whereBetween('transaction_date', [$dateConfig['start'], $dateConfig['end']])
            ->selectRaw('DATE(transaction_date) as date, SUM(total_cost) as total')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return $purchases->map(fn ($p) => ['date' => Carbon::parse($p->date)->format('d M'), 'total' => (float) $p->total])->toArray();
    }

    public function getSalesPurchaseComparison(?array $locationIds, array $dateConfig): array
    {
        $sales = Sell::accessibleBy($locationIds)->where('status', Sell::STATUS_COMPLETED)
            ->whereBetween('transaction_date', [$dateConfig['start'], $dateConfig['end']])
            ->selectRaw('DATE(transaction_date) as date, SUM(total_price) as sales')->groupBy('date')->get()->keyBy('date');

        $purchases = Purchase::accessibleBy($locationIds)->where('status', Purchase::STATUS_COMPLETED)
            ->whereBetween('transaction_date', [$dateConfig['start'], $dateConfig['end']])
            ->selectRaw('DATE(transaction_date) as date, SUM(total_cost) as purchases')->groupBy('date')->get()->keyBy('date');

        $allDates = $sales->keys()->merge($purchases->keys())->unique()->sort();

        return $allDates->map(fn ($date) => [
            'date' => Carbon::parse($date)->format('d M'),
            'sales' => (float) ($sales[$date]->sales ?? 0),
            'purchases' => (float) ($purchases[$date]->purchases ?? 0),
        ])->values()->toArray();
    }

    public function getPaymentChannelChart(?array $locationIds, array $dateConfig): array
    {
        return Sell::accessibleBy($locationIds)
            ->where('status', Sell::STATUS_COMPLETED)
            ->whereBetween('transaction_date', [$dateConfig['start'], $dateConfig['end']])
            ->join('types', 'sells.payment_method_type_id', '=', 'types.id')
            ->selectRaw('types.name as name, COUNT(*) as count')
            ->groupBy('types.name')
            ->get()
            ->toArray();
    }

    public function getTopSellingItems(?array $locationIds, array $dateConfig): array
    {
        return StockMovement::whereHasMorph('reference', [Sell::class], fn ($q) => $q->accessibleBy($locationIds)->where('status', Sell::STATUS_COMPLETED)->whereBetween('transaction_date', [$dateConfig['start'], $dateConfig['end']]))
            ->join('products', 'stock_movements.product_id', '=', 'products.id')
            ->selectRaw('products.name, SUM(ABS(stock_movements.quantity)) as total_qty')
            ->groupBy('products.id', 'products.name')
            ->orderByDesc('total_qty')
            ->take(5)
            ->get()
            ->toArray();
    }
}

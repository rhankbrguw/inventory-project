<?php

namespace App\Http\Controllers;

use App\Models\Location;
use App\Models\Product;
use App\Models\Sell;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $accessibleLocationIds = $user->getAccessibleLocationIds();

        $locationId = $request->input('location_id');
        $productId = $request->input('product_id');

        if ($accessibleLocationIds && $locationId && $locationId !== 'all' && !in_array($locationId, $accessibleLocationIds)) {
            $locationId = null;
        }

        $dateRange = $request->input('date_range', 'this_month');
        $startDateInput = $request->input('start_date');
        $endDateInput = $request->input('end_date');

        if ($dateRange === 'custom' && $startDateInput && $endDateInput) {
            $startDate = Carbon::parse($startDateInput)->startOfDay();
            $endDate = Carbon::parse($endDateInput)->endOfDay();
            $dateLabel = Carbon::parse($startDateInput)->format('d M') . ' - ' . Carbon::parse($endDateInput)->format('d M Y');
        } elseif ($dateRange === 'today') {
            $startDate = now()->startOfDay();
            $endDate = now()->endOfDay();
            $dateLabel = 'Hari Ini';
        } elseif ($dateRange === 'last_7_days') {
            $startDate = now()->subDays(6)->startOfDay();
            $endDate = now()->endOfDay();
            $dateLabel = '7 Hari Terakhir';
        } else {
            $startDate = now()->startOfMonth();
            $endDate = now()->endOfMonth();
            $dateLabel = now()->translatedFormat('F Y');
        }

        $query = StockMovement::query()
            ->where('type', 'sell')
            ->whereHasMorph('reference', [Sell::class], function ($q) use ($startDate, $endDate, $locationId, $accessibleLocationIds) {
                $q->where('status', 'Completed')
                    ->whereBetween('transaction_date', [$startDate, $endDate]);

                if ($locationId && $locationId !== 'all') {
                    $q->where('location_id', $locationId);
                } elseif ($accessibleLocationIds) {
                    $q->whereIn('location_id', $accessibleLocationIds);
                }
            });

        if ($productId && $productId !== 'all') {
            $query->where('product_id', $productId);
        }

        $statsQuery = clone $query;

        $totalSales = $statsQuery->sum(DB::raw('ABS(quantity) * cost_per_unit'));
        $totalItemsSold = $statsQuery->sum(DB::raw('ABS(quantity)'));

        $transactionCount = $statsQuery->distinct('reference_id')->count('reference_id');

        $avgTransaction = $transactionCount > 0 ? $totalSales / $transactionCount : 0;

        $dailyData = (clone $query)
            ->selectRaw('DATE(created_at) as date, SUM(ABS(quantity) * cost_per_unit) as value')
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(function ($item) {
                return [
                    'date' => Carbon::parse($item->date)->format('d M'),
                    'value' => (float) $item->value,
                ];
            });

        $chartData = [];
        $period = \Carbon\CarbonPeriod::create($startDate, $endDate);
        foreach ($period as $date) {
            $formattedDate = $date->format('d M');
            $found = $dailyData->firstWhere('date', $formattedDate);
            $chartData[] = [
                'date' => $formattedDate,
                'sales' => $found ? $found['value'] : 0,
            ];
        }

        $topProducts = (clone $query)
            ->with('product')
            ->selectRaw('product_id, SUM(ABS(quantity)) as quantity, SUM(ABS(quantity) * cost_per_unit) as revenue')
            ->groupBy('product_id')
            ->orderByDesc('quantity')
            ->limit(10)
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->product->name,
                    'sku' => $item->product->sku,
                    'quantity' => (float) $item->quantity,
                    'revenue' => (float) $item->revenue,
                ];
            });

        $locationsQuery = Location::orderBy('name');
        if ($accessibleLocationIds) {
            $locationsQuery->whereIn('id', $accessibleLocationIds);
        }

        return Inertia::render('Reports/Index', [
            'locations' => $locationsQuery->get(['id', 'name']),
            'products' => Product::orderBy('name')->get(['id', 'name']),
            'filters' => [
                'location_id' => $locationId,
                'product_id' => $productId,
                'date_range' => $dateRange,
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d'),
                'resolved_label' => $dateLabel,
            ],
            'stats' => [
                'total_sales' => $totalSales,
                'total_items_sold' => $totalItemsSold,
                'transaction_count' => $transactionCount,
                'average_transaction' => $avgTransaction,
            ],
            'charts' => [
                'daily_trend' => $chartData,
                'top_products' => $topProducts,
            ],
        ]);
    }
}

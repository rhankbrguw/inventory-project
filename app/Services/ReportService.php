<?php

namespace App\Services;

use App\Models\Location;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\Sell;
use App\Models\StockMovement;
use App\Models\User;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class ReportService
{
    private const CACHE_TTL_SECONDS = 600;

    public function getReportData(User $user, Request $request): array
    {
        $accessibleIds = $user->getAccessibleLocationIds();
        $locationId = $this->resolveLocationId($request->input('location_id'), $accessibleIds);
        $productId = $request->input('product_id');
        [$startDate, $endDate, $dateLabel] = $this->resolveDateRange($request);

        $metrics = $this->getCalculatedMetrics($startDate, $endDate, $locationId, $productId, $accessibleIds);

        return [
            'locations' => $this->getLocationsList($accessibleIds),
            'products' => Cache::remember('all_products_dropdown_simple', 3600, fn () => Product::orderBy('name')->get(['id', 'name'])),
            'filters' => [
                'location_id' => $locationId, 'product_id' => $productId,
                'date_range' => $request->input('date_range', 'this_month'),
                'start_date' => $startDate->format('Y-m-d'), 'end_date' => $endDate->format('Y-m-d'),
                'resolved_label' => $dateLabel,
            ],
            'stats' => $metrics['stats'],
            'charts' => [
                'daily_trend' => $metrics['daily_trend'],
                'top_products' => $metrics['top_products'],
            ],
        ];
    }

    private function getCalculatedMetrics(Carbon $startDate, Carbon $endDate, ?string $locationId, ?string $productId, ?array $accessibleIds): array
    {
        $cacheHash = md5(json_encode([$accessibleIds, $locationId, $productId, $startDate->toDateTimeString(), $endDate->toDateTimeString()]));

        return Cache::remember("report_metrics_{$cacheHash}", self::CACHE_TTL_SECONDS, function () use ($startDate, $endDate, $locationId, $productId, $accessibleIds) {
            $query = $this->buildMovementsQuery($startDate, $endDate, $locationId, $productId, $accessibleIds);

            return [
                'stats' => $this->calculateStats(clone $query),
                'daily_trend' => $this->getDailyTrend(clone $query, $startDate, $endDate),
                'top_products' => $this->getTopProducts(clone $query),
            ];
        });
    }

    private function getLocationsList(?array $accessibleIds): \Illuminate\Database\Eloquent\Collection
    {
        $q = Location::orderBy('name');
        if ($accessibleIds) {
            $q->whereIn('id', $accessibleIds);
        }

        return $q->get(['id', 'name']);
    }

    private function resolveLocationId(?string $locId, ?array $accessibleIds): ?string
    {
        if ($accessibleIds && $locId && $locId !== 'all' && ! in_array((int) $locId, $accessibleIds)) {
            return null;
        }

        return $locId;
    }

    private function resolveDateRange(Request $request): array
    {
        $range = $request->input('date_range', 'this_month');
        $startIn = $request->input('start_date');
        $endIn = $request->input('end_date');

        if ($range === 'custom' && $startIn && $endIn) {
            return [Carbon::parse($startIn)->startOfDay(), Carbon::parse($endIn)->endOfDay(), Carbon::parse($startIn)->format('d M').' - '.Carbon::parse($endIn)->format('d M Y')];
        }

        return match ($range) {
            'today' => [now()->startOfDay(), now()->endOfDay(), __('messages.date.today')],
            'last_7_days' => [now()->subDays(6)->startOfDay(), now()->endOfDay(), __('messages.date.last_7_days')],
            default => [now()->startOfMonth(), now()->endOfMonth(), now()->translatedFormat('F Y')],
        };
    }

    private function buildMovementsQuery(Carbon $start, Carbon $end, ?string $locId, ?string $prodId, ?array $accessibleIds): Builder
    {
        return StockMovement::query()
            ->where('type', 'sell')
            ->whereHasMorph('reference', [Sell::class], function ($q) use ($start, $end, $locId, $accessibleIds) {
                $q->where('status', Purchase::STATUS_COMPLETED)->whereBetween('transaction_date', [$start, $end]);
                if ($locId && $locId !== 'all') {
                    $q->where('location_id', $locId);
                } elseif ($accessibleIds) {
                    $q->whereIn('location_id', $accessibleIds);
                }
            })
            ->when($prodId && $prodId !== 'all', fn ($q) => $q->where('product_id', $prodId));
    }

    private function calculateStats(Builder $query): array
    {
        $totalSales = (float) $query->sum(DB::raw('ABS(quantity) * cost_per_unit'));
        $totalItemsSold = (float) $query->sum(DB::raw('ABS(quantity)'));
        $txCount = (int) $query->distinct('reference_id')->count('reference_id');

        return [
            'total_sales' => $totalSales, 'total_items_sold' => $totalItemsSold,
            'transaction_count' => $txCount, 'average_transaction' => $txCount > 0 ? $totalSales / $txCount : 0,
        ];
    }

    private function getDailyTrend(Builder $query, Carbon $start, Carbon $end): array
    {
        $daily = $query->selectRaw('date, SUM(ABS(quantity) * cost_per_unit) as value')
            ->groupBy('date')->orderBy('date')->get()
            ->map(fn ($i) => ['date' => Carbon::parse($i->date)->format('d M'), 'value' => (float) $i->value]);

        return collect(CarbonPeriod::create($start, $end))->map(function ($date) use ($daily) {
            $formatted = $date->format('d M');
            $found = $daily->firstWhere('date', $formatted);

            return ['date' => $formatted, 'sales' => $found ? $found['value'] : 0];
        })->all();
    }

    private function getTopProducts(Builder $query): array
    {
        return $query->with('product')
            ->selectRaw('product_id, SUM(ABS(quantity)) as quantity, SUM(ABS(quantity) * cost_per_unit) as revenue')
            ->groupBy('product_id')->orderByDesc('quantity')->limit(10)->get()
            ->map(fn ($i) => ['name' => $i->product->name, 'sku' => $i->product->sku, 'quantity' => (float) $i->quantity, 'revenue' => (float) $i->revenue])
            ->toArray();
    }
}

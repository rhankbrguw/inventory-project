<?php

namespace App\Http\Controllers;

use App\Http\Resources\StockMovementResource;
use App\Models\Inventory;
use App\Models\Location;
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

        $selectedLocationId = $request->input('location_id');

        if ($selectedLocationId && $selectedLocationId !== 'all') {
            if ($user->level !== 1 && !in_array($selectedLocationId, $accessibleLocationIds ?? [])) {
                abort(403, 'Unauthorized access to this location.');
            }
            $filterIds = [$selectedLocationId];
        } else {
            $filterIds = $accessibleLocationIds;
        }

        $dateRange = $request->input('date_range', 'this_month');

        return Inertia::render('Dashboard', [
            'stats' => $this->getStats($filterIds, $dateRange),
            'charts' => [
                'sales' => $this->getSalesChart($filterIds, $dateRange),
                'channels' => $this->getPaymentChannelChart($filterIds, $dateRange),
                'top_items' => $this->getTopSellingItems($filterIds, $dateRange),
            ],
            'recentMovements' => StockMovementResource::collection($this->getRecentMovements($filterIds)),
            'locations' => $this->getLocationsForDropdown($user),
            'filters' => $request->only(['location_id', 'date_range']),
        ]);
    }

    private function getStats(?array $locationIds, string $range): array
    {
        $query = Sell::accessibleBy($locationIds)->where('status', 'Completed');
        $purchaseQuery = Purchase::accessibleBy($locationIds)->where('status', 'Completed');

        $startDate = match ($range) {
            'today' => Carbon::today(),
            'last_7_days' => Carbon::today()->subDays(6),
            'this_month' => Carbon::now()->startOfMonth(),
            default => Carbon::now()->startOfMonth(),
        };

        $query->whereDate('transaction_date', '>=', $startDate);
        $purchaseQuery->whereDate('transaction_date', '>=', $startDate);

        $revenue = (clone $query)->sum('total_price') ?? 0;

        $procurementCost = (clone $purchaseQuery)->sum('total_cost') ?? 0;

        $cogs = StockMovement::whereHasMorph('reference', [Sell::class], function ($q) use ($locationIds, $startDate) {
            $q->accessibleBy($locationIds)
                ->where('status', 'Completed')
                ->whereDate('transaction_date', '>=', $startDate);
        })
            ->select(DB::raw('SUM(quantity * average_cost_per_unit) as total_cogs'))
            ->value('total_cogs') ?? 0;

        $netProfit = $revenue - $cogs;

        $inventoryValue = Inventory::accessibleBy($locationIds)
            ->select(DB::raw('SUM(quantity * average_cost) as total_value'))
            ->value('total_value') ?? 0;

        $lowStockCount = Inventory::accessibleBy($locationIds)
            ->where('quantity', '<=', 5)
            ->where('quantity', '>', 0)
            ->count();

        return [
            'revenue' => (float) $revenue,
            'procurement_cost' => (float) $procurementCost,
            'net_profit' => (float) $netProfit,
            'inventory_value' => (float) $inventoryValue,
            'low_stock_count' => $lowStockCount,
        ];
    }

    private function getSalesChart(?array $locationIds, string $range): array
    {
        $startDate = match ($range) {
            'today' => Carbon::today(),
            'last_7_days' => Carbon::today()->subDays(6),
            'this_month' => Carbon::now()->startOfMonth(),
            default => Carbon::now()->startOfMonth(),
        };

        $endDate = Carbon::now();

        $sales = Sell::accessibleBy($locationIds)
            ->where('status', 'Completed')
            ->whereDate('transaction_date', '>=', $startDate)
            ->whereDate('transaction_date', '<=', $endDate)
            ->selectRaw('DATE(transaction_date) as date, SUM(total_price) as total')
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        $dateRangeArray = [];
        $currentDate = $startDate->copy();

        while ($currentDate <= $endDate) {
            $dateKey = $currentDate->format('Y-m-d');
            $dateRangeArray[] = [
                'date' => $currentDate->format('d M'),
                'total' => (float) ($sales->get($dateKey)?->total ?? 0),
            ];
            $currentDate->addDay();
        }

        return $dateRangeArray;
    }

    private function getPaymentChannelChart(?array $locationIds, string $range): array
    {
        $startDate = match ($range) {
            'today' => Carbon::today(),
            'last_7_days' => Carbon::today()->subDays(6),
            'this_month' => Carbon::now()->startOfMonth(),
            default => Carbon::now()->startOfMonth(),
        };

        $data = Sell::accessibleBy($locationIds)
            ->where('status', 'Completed')
            ->whereDate('transaction_date', '>=', $startDate)
            ->join('types', 'sells.payment_method_type_id', '=', 'types.id')
            ->selectRaw('types.name as name, COUNT(*) as count')
            ->groupBy('types.name')
            ->get();

        if ($data->isEmpty()) {
            return [
                ['name' => 'No Data', 'count' => 1]
            ];
        }

        return $data->map(fn ($item) => [
            'name' => $item->name,
            'count' => (int) $item->count,
        ])->toArray();
    }

    private function getTopSellingItems(?array $locationIds, string $range): array
    {
        $startDate = match ($range) {
            'today' => Carbon::today(),
            'last_7_days' => Carbon::today()->subDays(6),
            'this_month' => Carbon::now()->startOfMonth(),
            default => Carbon::now()->startOfMonth(),
        };

        $items = StockMovement::whereHasMorph('reference', [Sell::class], function ($q) use ($locationIds, $startDate) {
            $q->accessibleBy($locationIds)
                ->where('status', 'Completed')
                ->whereDate('transaction_date', '>=', $startDate);
        })
            ->join('products', 'stock_movements.product_id', '=', 'products.id')
            ->selectRaw('products.name, SUM(ABS(stock_movements.quantity)) as total_qty')
            ->groupBy('products.name')
            ->orderByDesc('total_qty')
            ->take(5)
            ->get();

        if ($items->isEmpty()) {
            return [];
        }

        return $items->map(fn ($item) => [
            'name' => $item->name,
            'total_qty' => (float) $item->total_qty,
        ])->toArray();
    }

    private function getRecentMovements(?array $locationIds)
    {
        return StockMovement::with(['product', 'location', 'reference'])
            ->accessibleBy($locationIds)
            ->latest('created_at')
            ->take(5)
            ->get();
    }

    private function getLocationsForDropdown($user)
    {
        if ($user->level === 1) {
            return Location::select('id', 'name')->orderBy('name')->get();
        }
        return $user->locations()->select('locations.id', 'locations.name')->orderBy('locations.name')->get();
    }
}

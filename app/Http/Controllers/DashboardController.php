<?php

namespace App\Http\Controllers;

use App\Http\Resources\StockMovementResource;
use App\Models\Inventory;
use App\Models\Location;
use App\Models\Sell;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Carbon;
use Illuminate\Http\RedirectResponse;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response|RedirectResponse
    {
        $user = Auth::user();
        $accessibleLocationIds = $user->getAccessibleLocationIds();

        if ($user->level !== 1 && !$request->has('location_id')) {
            if (!empty($accessibleLocationIds)) {
                return to_route('dashboard', [
                    'location_id' => $accessibleLocationIds[0],
                    'date_range' => 'this_month'
                ]);
            }
        }

        $selectedLocationId = $request->input('location_id');

        if ($selectedLocationId !== null && $selectedLocationId !== 'all') {
            if ($user->level !== 1 && !in_array((int)$selectedLocationId, $accessibleLocationIds ?? [])) {
                abort(403, 'Unauthorized access to this location.');
            }
            $filterIds = [$selectedLocationId];
        } else {
            $filterIds = $accessibleLocationIds;
        }

        $dateConfig = $this->parseDateRange($request);

        return Inertia::render('Dashboard/Index', [
            'stats' => $this->getStats($filterIds, $dateConfig),
            'charts' => [
                'sales' => $this->getSalesChart($filterIds, $dateConfig),
                'channels' => $this->getPaymentChannelChart($filterIds, $dateConfig),
                'top_items' => $this->getTopSellingItems($filterIds, $dateConfig),
            ],
            'recentMovements' => StockMovementResource::collection($this->getRecentMovements($filterIds)),
            'locations' => $this->getLocationsForDropdown($user),
            'filters' => array_merge($request->only(['location_id', 'date_range', 'start_date', 'end_date']), [
                'resolved_label' => $dateConfig['label'],
            ]),
        ]);
    }

    private function parseDateRange(Request $request): array
    {
        $range = $request->input('date_range', 'this_month');

        if ($range === 'custom' && $request->filled(['start_date', 'end_date'])) {
            $start = Carbon::parse($request->input('start_date'))->startOfDay();
            $end = Carbon::parse($request->input('end_date'))->endOfDay();
            return [
                'start' => $start,
                'end' => $end,
                'label' => $start->format('d M') . ' - ' . $end->format('d M')
            ];
        }

        return match ($range) {
            'today' => [
                'start' => Carbon::today(),
                'end' => Carbon::today()->endOfDay(),
                'label' => 'Hari Ini'
            ],
            'last_7_days' => [
                'start' => Carbon::today()->subDays(6)->startOfDay(),
                'end' => Carbon::today()->endOfDay(),
                'label' => '7 Hari Terakhir'
            ],
            default => [
                'start' => Carbon::now()->startOfMonth(),
                'end' => Carbon::now()->endOfMonth(),
                'label' => 'Bulan Ini'
            ],
        };
    }

    private function getStats(?array $locationIds, array $dateConfig): array
    {
        $start = $dateConfig['start'];
        $end = $dateConfig['end'];

        $revenue = Sell::accessibleBy($locationIds)
            ->where('status', 'Completed')
            ->whereBetween('transaction_date', [$start, $end])
            ->sum('total_price');

        $cogs = StockMovement::whereHasMorph('reference', [Sell::class], function ($q) use ($locationIds, $start, $end) {
            $q->accessibleBy($locationIds)
                ->where('status', 'Completed')
                ->whereBetween('transaction_date', [$start, $end]);
        })
            ->sum(DB::raw('ABS(quantity) * average_cost_per_unit'));

        $netProfit = $revenue - $cogs;

        $inventoryValue = Inventory::accessibleBy($locationIds)
            ->sum(DB::raw('quantity * average_cost'));

        $lowStockCount = Inventory::accessibleBy($locationIds)
            ->where('quantity', '<=', 5)
            ->where('quantity', '>', 0)
            ->count();

        return [
            'revenue' => (float) $revenue,
            'net_profit' => (float) $netProfit,
            'inventory_value' => (float) $inventoryValue,
            'low_stock_count' => $lowStockCount,
        ];
    }

    private function getSalesChart(?array $locationIds, array $dateConfig): array
    {
        $sales = Sell::accessibleBy($locationIds)
            ->where('status', 'Completed')
            ->whereBetween('transaction_date', [$dateConfig['start'], $dateConfig['end']])
            ->selectRaw('DATE(transaction_date) as date, SUM(total_price) as total')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return $sales->map(fn($s) => [
            'date' => Carbon::parse($s->date)->format('d M'),
            'total' => (float) $s->total,
        ])->toArray();
    }

    private function getPaymentChannelChart(?array $locationIds, array $dateConfig): array
    {
        return Sell::accessibleBy($locationIds)
            ->where('status', 'Completed')
            ->whereBetween('transaction_date', [$dateConfig['start'], $dateConfig['end']])
            ->join('types', 'sells.payment_method_type_id', '=', 'types.id')
            ->selectRaw('types.name as name, COUNT(*) as count')
            ->groupBy('types.name')
            ->get()
            ->toArray();
    }

    private function getTopSellingItems(?array $locationIds, array $dateConfig): array
    {
        return StockMovement::whereHasMorph('reference', [Sell::class], function ($q) use ($locationIds, $dateConfig) {
            $q->accessibleBy($locationIds)
                ->where('status', 'Completed')
                ->whereBetween('transaction_date', [$dateConfig['start'], $dateConfig['end']]);
        })
            ->join('products', 'stock_movements.product_id', '=', 'products.id')
            ->selectRaw('products.name, SUM(ABS(stock_movements.quantity)) as total_qty')
            ->groupBy('products.id', 'products.name')
            ->orderByDesc('total_qty')
            ->take(5)
            ->get()
            ->toArray();
    }

    private function getRecentMovements(?array $locationIds)
    {
        return StockMovement::with(['product', 'location', 'reference'])
            ->accessibleBy($locationIds)
            ->latest('created_at')
            ->take(6)
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

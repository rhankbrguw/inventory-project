<?php

namespace App\Http\Controllers\Transaction;

use App\Http\Controllers\Controller;
use App\Http\Resources\Transaction\TransactionResource;
use App\Models\Location;
use App\Models\Purchase;
use App\Models\Sell;
use App\Models\StockTransfer;
use App\Models\Type;
use Illuminate\Database\Query\Builder;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class TransactionController extends Controller
{
    public function index(Request $request): Response
    {
        $perPage = $request->input('per_page', 15);
        $search = $request->input('search');
        $locationId = $request->input('location_id');
        $typeId = $request->input('type');
        $sort = $request->input('sort', 'newest');
        $statusFilter = $request->input('status');

        $user = Auth::user();
        $accessibleLocationIds = $user->getAccessibleLocationIds();

        $purchasesQuery = DB::table('purchases')
            ->select(
                'purchases.id',
                'purchases.type_id',
                'purchases.reference_code',
                'purchases.transaction_date',
                'purchases.total_cost AS total_amount',
                'purchases.created_at',
                'purchases.location_id',
                'purchases.user_id',
                'purchases.supplier_id AS party_id',
                DB::raw("'purchase' AS transaction_type"),
                DB::raw("'supplier' AS party_type"),
                DB::raw("'completed' AS status")
            )
            ->when($accessibleLocationIds, fn ($q) => $q->whereIn('purchases.location_id', $accessibleLocationIds))
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('purchases.reference_code', 'like', "%{$search}%")
                        ->orWhereExists(function (Builder $subQuery) use ($search) {
                            $subQuery->select(DB::raw(1))
                                ->from('suppliers')
                                ->whereColumn('suppliers.id', 'purchases.supplier_id')
                                ->where('suppliers.name', 'like', "%{$search}%");
                        });
                });
            })
            ->when($locationId && $locationId !== 'all', fn ($q) => $q->where('purchases.location_id', $locationId));

        $sellsQuery = DB::table('sells')
            ->select(
                'sells.id',
                'sells.type_id',
                'sells.reference_code',
                'sells.transaction_date',
                'sells.total_price AS total_amount',
                'sells.created_at',
                'sells.location_id',
                'sells.user_id',
                'sells.customer_id AS party_id',
                DB::raw("'sell' AS transaction_type"),
                DB::raw("'customer' AS party_type"),
                DB::raw("'completed' AS status")
            )
            ->when($accessibleLocationIds, fn ($q) => $q->whereIn('sells.location_id', $accessibleLocationIds))
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('sells.reference_code', 'like', "%{$search}%")
                        ->orWhereExists(function (Builder $subQuery) use ($search) {
                            $subQuery->select(DB::raw(1))
                                ->from('customers')
                                ->whereColumn('customers.id', 'sells.customer_id')
                                ->where('customers.name', 'like', "%{$search}%");
                        });
                });
            })
            ->when($locationId && $locationId !== 'all', fn ($q) => $q->where('sells.location_id', $locationId));

        $transfersQuery = DB::table('stock_transfers')
            ->select(
                'stock_transfers.id',
                DB::raw('NULL AS type_id'),
                'stock_transfers.reference_code',
                'stock_transfers.transfer_date AS transaction_date',
                DB::raw('0 AS total_amount'),
                'stock_transfers.created_at',
                'stock_transfers.from_location_id AS location_id',
                'stock_transfers.user_id',
                'stock_transfers.to_location_id AS party_id',
                DB::raw("'transfer' AS transaction_type"),
                DB::raw("'location' AS party_type"),
                'stock_transfers.status'
            )
            ->when($accessibleLocationIds, function ($q) use ($accessibleLocationIds) {
                $q->where(function ($sub) use ($accessibleLocationIds) {
                    $sub->whereIn('stock_transfers.from_location_id', $accessibleLocationIds)
                        ->orWhereIn('stock_transfers.to_location_id', $accessibleLocationIds);
                });
            })
            ->when($search, fn ($q, $search) => $q->where('stock_transfers.reference_code', 'like', "%{$search}%"))
            ->when($locationId && $locationId !== 'all', function ($q) use ($locationId) {
                $q->where(function ($sub) use ($locationId) {
                    $sub->where('stock_transfers.from_location_id', $locationId)
                        ->orWhere('stock_transfers.to_location_id', $locationId);
                });
            });

        $unionQuery = $purchasesQuery->unionAll($sellsQuery)->unionAll($transfersQuery);

        if ($typeId && $typeId !== 'all') {
            $unionQuery = DB::query()->fromSub($unionQuery, 'transactions')
                ->where('transactions.type_id', $typeId);
        } else {
            $unionQuery = DB::query()->fromSub($unionQuery, 'transactions');
        }

        if ($statusFilter && $statusFilter !== 'all') {
            $unionQuery->where('status', $statusFilter);
        }

        match ($sort) {
            'total_desc' => $unionQuery->orderBy('total_amount', 'desc'),
            'total_asc' => $unionQuery->orderBy('total_amount', 'asc'),
            'oldest' => $unionQuery->orderBy('transaction_date', 'asc')->orderBy('created_at', 'asc'),
            default => $unionQuery->orderBy('transaction_date', 'desc')->orderBy('created_at', 'desc'),
        };

        $paginatedResults = $unionQuery->paginate($perPage);

        $purchaseIds = [];
        $sellIds = [];
        $transferIds = [];

        foreach ($paginatedResults->items() as $item) {
            match ($item->transaction_type) {
                'purchase' => $purchaseIds[] = $item->id,
                'sell' => $sellIds[] = $item->id,
                'transfer' => $transferIds[] = $item->id,
                default => null,
            };
        }

        $purchases = Purchase::with([
            'type:id,name',
            'location:id,name',
            'user:id,name',
            'supplier:id,name',
            'paymentMethodType:id,name',
            'stockMovements' => fn ($q) => $q->select('id', 'reference_type', 'reference_id', 'product_id')
                ->with('product:id,name')
                ->limit(2)
        ])->findMany($purchaseIds)->keyBy('id');

        $sells = Sell::with([
            'type:id,name',
            'location:id,name',
            'user:id,name',
            'customer:id,name',
            'paymentMethod:id,name',
            'stockMovements' => fn ($q) => $q->select('id', 'reference_type', 'reference_id', 'product_id')
                ->with('product:id,name')
                ->limit(2)
        ])->findMany($sellIds)->keyBy('id');

        $transfers = StockTransfer::with([
            'fromLocation:id,name',
            'toLocation:id,name',
            'user:id,name',
            'stockMovements' => fn ($q) => $q->select('id', 'reference_type', 'reference_id', 'product_id')
                ->with('product:id,name')
                ->limit(2)
        ])->findMany($transferIds)->keyBy('id');

        $items = collect($paginatedResults->items())->map(function ($item) use ($purchases, $sells, $transfers) {
            $model = match ($item->transaction_type) {
                'purchase' => $purchases->get($item->id),
                'sell' => $sells->get($item->id),
                'transfer' => $transfers->get($item->id),
                default => null,
            };

            if ($model) {
                if ($model instanceof Purchase) {
                    $model->total_cost = $item->total_amount;
                } elseif ($model instanceof Sell) {
                    $model->total_price = $item->total_amount;
                }
            }

            return $model;
        })->filter();

        $paginatedTransactions = new LengthAwarePaginator(
            $items,
            $paginatedResults->total(),
            $paginatedResults->perPage(),
            $paginatedResults->currentPage(),
            ['path' => $request->url(), 'query' => $request->query()]
        );

        $locationsQuery = Location::select('id', 'name')->orderBy('name');
        if ($accessibleLocationIds) {
            $locationsQuery->whereIn('id', $accessibleLocationIds);
        }

        $locations = Cache::remember(
            'locations_' . ($accessibleLocationIds ? implode('_', $accessibleLocationIds) : 'all'),
            3600,
            fn () => $locationsQuery->get()
        );

        $transactionTypes = Cache::remember(
            'transaction_types',
            3600,
            fn () => Type::where('group', Type::GROUP_TRANSACTION)->select('id', 'name')->orderBy('name')->get()
        );

        return Inertia::render('Transactions/Index', [
            'transactions' => TransactionResource::collection($paginatedTransactions),
            'locations' => $locations,
            'transactionTypes' => $transactionTypes,
            'filters' => (object) $request->only(['search', 'sort', 'location_id', 'type', 'status', 'per_page']),
        ]);
    }
}

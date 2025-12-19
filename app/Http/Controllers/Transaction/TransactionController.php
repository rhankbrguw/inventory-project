<?php

namespace App\Http\Controllers\Transaction;

use App\Http\Controllers\Controller;
use App\Http\Resources\Transaction\TransactionResource;
use App\Models\Location;
use App\Models\Purchase;
use App\Models\Sell;
use App\Models\Type;
use Illuminate\Database\Query\Builder;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class TransactionController extends Controller
{
    public function index(Request $request): Response
    {
        $request->user()->load(['locations.type']);

        $perPage = $request->input('per_page', 15);
        $search = $request->input('search');
        $locationId = $request->input('location_id');
        $typeId = $request->input('type');
        $sort = $request->input('sort', 'newest');

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
                DB::raw("'supplier' AS party_type")
            )
            ->when($accessibleLocationIds, function ($query) use ($accessibleLocationIds) {
                $query->whereIn('purchases.location_id', $accessibleLocationIds);
            })
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q
                        ->where('purchases.reference_code', 'like', "%{$search}%")
                        ->orWhereExists(function (Builder $subQuery) use ($search) {
                            $subQuery
                                ->select(DB::raw(1))
                                ->from('suppliers')
                                ->whereColumn('suppliers.id', 'purchases.supplier_id')
                                ->where('suppliers.name', 'like', "%{$search}%");
                        });
                });
            })
            ->when($locationId && $locationId !== 'all', fn($q) => $q->where('purchases.location_id', $locationId));

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
                DB::raw("'customer' AS party_type")
            )
            ->when($accessibleLocationIds, function ($query) use ($accessibleLocationIds) {
                $query->whereIn('sells.location_id', $accessibleLocationIds);
            })
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q
                        ->where('sells.reference_code', 'like', "%{$search}%")
                        ->orWhereExists(function (Builder $subQuery) use ($search) {
                            $subQuery
                                ->select(DB::raw(1))
                                ->from('customers')
                                ->whereColumn('customers.id', 'sells.customer_id')
                                ->where('customers.name', 'like', "%{$search}%");
                        });
                });
            })
            ->when($locationId && $locationId !== 'all', fn($q) => $q->where('sells.location_id', $locationId));

        $unionQuery = $purchasesQuery->unionAll($sellsQuery);

        if ($typeId && $typeId !== 'all') {
            $unionQuery = DB::query()
                ->fromSub($unionQuery, 'transactions')
                ->where('transactions.type_id', $typeId);
        } else {
            $unionQuery = DB::query()->fromSub($unionQuery, 'transactions');
        }

        match ($sort) {
            'total_desc' => $unionQuery->orderBy('total_amount', 'desc'),
            'total_asc' => $unionQuery->orderBy('total_amount', 'asc'),
            'oldest' => $unionQuery->orderBy('transaction_date', 'asc')->orderBy('created_at', 'asc'),
            default => $unionQuery->orderBy('transaction_date', 'desc')->orderBy('created_at', 'desc'),
        };

        $paginatedResults = $unionQuery->paginate($perPage);

        $items = collect($paginatedResults->items())->map(function ($item) {
            $model = null;
            $relationsToLoad = [
                'type',
                'location',
                'user',
                'stockMovements' => function ($query) {
                    $query->with(['product' => function ($productQuery) {
                        $productQuery->with('defaultSupplier:id,name');
                    }]);
                }
            ];

            if ($item->party_type === 'supplier') {
                $model = Purchase::find($item->id);
                if ($model) {
                    $model->load(array_merge($relationsToLoad, ['supplier', 'paymentMethodType']));
                }
            } elseif ($item->party_type === 'customer') {
                $model = Sell::find($item->id);
                if ($model) {
                    $model->load(array_merge($relationsToLoad, ['customer', 'paymentMethod']));
                }
            }

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

        $locationsQuery = Location::orderBy('name');
        if ($accessibleLocationIds) {
            $locationsQuery->whereIn('id', $accessibleLocationIds);
        }

        return Inertia::render('Transactions/Index', [
            'transactions' => TransactionResource::collection($paginatedTransactions),
            'locations' => $locationsQuery->get(['id', 'name']),
            'transactionTypes' => Type::where('group', Type::GROUP_TRANSACTION)->orderBy('name')->get(['id', 'name']),
            'filters' => (object) $request->only(['search', 'sort', 'location_id', 'type', 'per_page']),
        ]);
    }
}

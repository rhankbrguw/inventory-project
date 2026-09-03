<?php

namespace App\Services;

use App\Models\Purchase;
use App\Models\Sell;
use App\Models\StockTransfer;
use Illuminate\Database\Query\Builder;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class TransactionQueryService
{
    public function getPaginatedTransactions(?array $accessibleLocationIds, array $params, string $requestUrl): LengthAwarePaginator
    {
        $perPage = $params['per_page'] ?? 15;
        $unionQuery = $this->buildUnionQuery($accessibleLocationIds, $params);
        $paginated = $unionQuery->paginate($perPage);

        $items = $this->hydrateModels($paginated->items());

        return new LengthAwarePaginator($items, $paginated->total(), $paginated->perPage(), $paginated->currentPage(), [
            'path' => $requestUrl,
            'query' => $params,
        ]);
    }

    private function buildUnionQuery(?array $accessibleIds, array $params): Builder
    {
        $search = $params['search'] ?? null;
        $locationId = $params['location_id'] ?? null;
        $typeId = $params['type'] ?? null;
        $status = $params['status'] ?? null;

        $pQuery = $this->buildPurchasesSubquery($accessibleIds, $search, $locationId);
        $sQuery = $this->buildSellsSubquery($accessibleIds, $search, $locationId);
        $tQuery = $this->buildTransfersSubquery($accessibleIds, $search, $locationId);

        $union = DB::query()->fromSub($pQuery->unionAll($sQuery)->unionAll($tQuery), 'transactions')
            ->when($typeId && $typeId !== 'all', fn ($q) => $q->where('transactions.type_id', $typeId))
            ->when($status && $status !== 'all', fn ($q) => $q->where('status', $status));

        return $this->applySorting($union, $params['sort'] ?? 'newest');
    }

    private function applySorting(Builder $query, string $sort): Builder
    {
        return match ($sort) {
            'total_desc' => $query->orderBy('total_amount', 'desc'),
            'total_asc' => $query->orderBy('total_amount', 'asc'),
            'oldest' => $query->orderBy('transaction_date', 'asc')->orderBy('created_at', 'asc'),
            default => $query->orderBy('transaction_date', 'desc')->orderBy('created_at', 'desc'),
        };
    }

    private function buildPurchasesSubquery(?array $accessibleIds, ?string $search, ?string $locationId): Builder
    {
        return DB::table('purchases')
            ->select('id', 'type_id', 'reference_code', 'transaction_date', 'total_cost AS total_amount', 'notes', 'created_at', 'location_id', 'user_id', 'supplier_id AS party_id', DB::raw("'purchase' AS transaction_type"), DB::raw("'supplier' AS party_type"), 'status')
            ->when($accessibleIds, fn ($q) => $q->where(fn ($sub) => $sub->whereIn('purchases.location_id', $accessibleIds)->orWhereIn('purchases.from_location_id', $accessibleIds)))
            ->when($search, fn ($q, $s) => $q->where(fn ($sub) => $sub
                ->where('purchases.reference_code', 'like', "%{$s}%")
                ->orWhereExists(fn ($sq) => $sq->select(DB::raw(1))->from('suppliers')->whereColumn('suppliers.id', 'purchases.supplier_id')->where('suppliers.name', 'like', "%{$s}%"))
                ->orWhereExists(fn ($lq) => $lq->select(DB::raw(1))->from('locations')->whereColumn('locations.id', 'purchases.from_location_id')->where('locations.name', 'like', "%{$s}%"))
            ))
            ->when($locationId && $locationId !== 'all', fn ($q) => $q->where(fn ($sub) => $sub->where('purchases.location_id', $locationId)->orWhere('purchases.from_location_id', $locationId)));
    }

    private function buildSellsSubquery(?array $accessibleIds, ?string $search, ?string $locationId): Builder
    {
        return DB::table('sells')
            ->select('id', 'type_id', 'reference_code', 'transaction_date', 'total_price AS total_amount', 'notes', 'created_at', 'location_id', 'user_id', 'customer_id AS party_id', DB::raw("'sell' AS transaction_type"), DB::raw("'customer' AS party_type"), 'status')
            ->when($accessibleIds, fn ($q) => $q->where(fn ($sub) => $sub->whereIn('sells.location_id', $accessibleIds)->orWhereIn('sells.target_location_id', $accessibleIds)))
            ->when($search, fn ($q, $s) => $q->where(fn ($sub) => $sub
                ->where('sells.reference_code', 'like', "%{$s}%")
                ->orWhereExists(fn ($sq) => $sq->select(DB::raw(1))->from('customers')->whereColumn('customers.id', 'sells.customer_id')->where('customers.name', 'like', "%{$s}%"))
                ->orWhereExists(fn ($lq) => $lq->select(DB::raw(1))->from('locations')->whereColumn('locations.id', 'sells.target_location_id')->where('locations.name', 'like', "%{$s}%"))
            ))
            ->when($locationId && $locationId !== 'all', fn ($q) => $q->where(fn ($sub) => $sub->where('sells.location_id', $locationId)->orWhere('sells.target_location_id', $locationId)));
    }

    private function buildTransfersSubquery(?array $accessibleIds, ?string $search, ?string $locationId): Builder
    {
        return DB::table('stock_transfers')
            ->select('id', DB::raw('NULL AS type_id'), 'reference_code', 'transfer_date AS transaction_date', DB::raw('0 AS total_amount'), 'notes', 'created_at', 'from_location_id AS location_id', 'user_id', 'to_location_id AS party_id', DB::raw("'transfer' AS transaction_type"), DB::raw("'location' AS party_type"), 'status')
            ->when($accessibleIds, fn ($q) => $q->where(fn ($sub) => $sub->whereIn('stock_transfers.from_location_id', $accessibleIds)->orWhereIn('stock_transfers.to_location_id', $accessibleIds)))
            ->when($search, fn ($q, $s) => $q->where('stock_transfers.reference_code', 'like', "%{$s}%"))
            ->when($locationId && $locationId !== 'all', fn ($q) => $q->where(fn ($sub) => $sub->where('stock_transfers.from_location_id', $locationId)->orWhere('stock_transfers.to_location_id', $locationId)));
    }

    private function hydrateModels(array $rawItems): \Illuminate\Support\Collection
    {
        $pIds = collect($rawItems)->where('transaction_type', 'purchase')->pluck('id')->all();
        $sIds = collect($rawItems)->where('transaction_type', 'sell')->pluck('id')->all();
        $tIds = collect($rawItems)->where('transaction_type', 'transfer')->pluck('id')->all();

        $purchases = Purchase::with(['type:id,name', 'location:id,name', 'fromLocation:id,name', 'user:id,name', 'supplier:id,name', 'paymentMethodType:id,name'])->findMany($pIds)->keyBy('id');
        $sells = Sell::with(['type:id,name', 'location:id,name', 'user:id,name', 'customer:id,name', 'targetLocation:id,name', 'paymentMethod:id,name'])->findMany($sIds)->keyBy('id');
        $transfers = StockTransfer::with(['fromLocation:id,name', 'toLocation:id,name', 'user:id,name'])->findMany($tIds)->keyBy('id');

        return collect($rawItems)->map(function ($item) use ($purchases, $sells, $transfers) {
            $m = match ($item->transaction_type) {
                'purchase' => $purchases->get($item->id), 'sell' => $sells->get($item->id), 'transfer' => $transfers->get($item->id), default => null
            };
            if ($m && $m instanceof Purchase) {
                $m->total_cost = $item->total_amount;
            } elseif ($m && $m instanceof Sell) {
                $m->total_price = $item->total_amount;
            }

            return $m;
        })->filter();
    }
}

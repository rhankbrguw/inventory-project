<?php

namespace App\Http\Controllers\Transaction;

use App\Http\Controllers\Controller;
use App\Http\Resources\Transaction\TransactionResource;
use App\Models\Location;
use App\Models\Type;
use App\Services\TransactionQueryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class TransactionController extends Controller
{
    public const CACHE_TTL_SECONDS = 3600;

    public const MAX_RECEIPT_PHOTO_KB = 15360;

    public function __construct(protected TransactionQueryService $queryService) {}

    public function index(Request $request): Response
    {
        $accessibleIds = Auth::user()->getAccessibleLocationIds();
        $paginated = $this->queryService->getPaginatedTransactions($accessibleIds, $request->all(), $request->url());

        return Inertia::render('Transactions/Index', [
            'transactions' => TransactionResource::collection($paginated),
            'locations' => $this->getCachedLocations($accessibleIds),
            'transactionTypes' => $this->getCachedTransactionTypes(),
            'filters' => (object) $request->only(['search', 'sort', 'location_id', 'type', 'status', 'per_page']),
        ]);
    }

    private function getCachedLocations(?array $accessibleIds): \Illuminate\Support\Collection
    {
        $key = 'locations_'.($accessibleIds ? implode('_', $accessibleIds) : 'all');

        return Cache::remember($key, self::CACHE_TTL_SECONDS, function () use ($accessibleIds) {
            $q = Location::select('id', 'name')->orderBy('name');
            if ($accessibleIds) {
                $q->whereIn('id', $accessibleIds);
            }

            return $q->get();
        });
    }

    private function getCachedTransactionTypes(): \Illuminate\Support\Collection
    {
        return Type::getForGroup(Type::GROUP_TRANSACTION);
    }
}

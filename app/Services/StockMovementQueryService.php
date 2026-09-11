<?php

namespace App\Services;

use App\Http\Resources\ProductResource;
use App\Http\Resources\StockMovementResource;
use App\Models\Location;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\Sell;
use App\Models\StockMovement;
use App\Models\StockTransfer;
use App\Models\User;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Http\Request;

class StockMovementQueryService
{
    public function getIndexData(User $user, Request $request): array
    {
        $accessibleIds = $user->getAccessibleLocationIds();
        $movements = $this->queryMovements($user, $accessibleIds, $request);
        $locations = $this->queryLocations($accessibleIds);
        $products = $this->queryProducts($user, $accessibleIds);

        return [
            'stockMovements' => StockMovementResource::collection($movements),
            'locations' => $locations->get(['id', 'name']),
            'products' => ProductResource::collection($products->get()),
            'movementTypes' => StockMovement::getMovementTypes(),
            'filters' => (object) $request->only(['search', 'location_id', 'product_id', 'type']),
        ];
    }

    private function queryMovements(User $user, ?array $accessibleIds, Request $request): \Illuminate\Contracts\Pagination\LengthAwarePaginator
    {
        $search = $request->input('search');
        $locationId = $request->input('location_id');
        $productId = $request->input('product_id');
        $type = $request->input('type');

        return StockMovement::with([
            'product', 'location',
            'reference' => fn (MorphTo $m) => $m->morphWith([
                Purchase::class => ['supplier', 'fromLocation'],
                Sell::class => ['customer', 'targetLocation'],
                StockTransfer::class => ['fromLocation', 'toLocation'],
                User::class => [],
            ]),
        ])
            ->whereHas('product', fn ($sq) => $sq->whereNull('deleted_at')->accessibleBy($user))
            ->when($accessibleIds, fn ($q) => $q->whereIn('location_id', $accessibleIds))
            ->when($search, fn ($q) => $q->whereHas('product', fn ($sq) => $sq->where('name', 'like', "%{$search}%")->orWhere('sku', 'like', "%{$search}%")))
            ->when($locationId && $locationId !== 'all', fn ($q) => $q->where('location_id', $locationId))
            ->when($productId, fn ($q) => $q->where('product_id', $productId))
            ->when($type && $type !== 'all', fn ($q) => $q->where('type', $type))
            ->latest('created_at')
            ->paginate(20)
            ->withQueryString();
    }

    private function queryLocations(?array $accessibleIds): \Illuminate\Database\Eloquent\Builder
    {
        $query = Location::orderBy('name');
        if ($accessibleIds) {
            $query->whereIn('id', $accessibleIds);
        }

        return $query;
    }

    private function queryProducts(User $user, ?array $accessibleIds): \Illuminate\Database\Eloquent\Builder
    {
        $query = Product::accessibleBy($user)->whereNull('deleted_at')->orderBy('name');
        if ($accessibleIds !== null) {
            $locationId = $user->locations->first()?->id;
            if ($locationId) {
                $query->with(['inventories' => fn ($q) => $q->where('location_id', $locationId)]);
            }
        }

        return $query;
    }
}

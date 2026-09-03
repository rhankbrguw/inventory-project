<?php

namespace App\Services;

use App\Http\Resources\InventoryResource;
use App\Models\Inventory;
use App\Models\Location;
use App\Models\Product;
use App\Models\Role;
use App\Models\Type;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;

class StockIndexQueryService
{
    public function getIndexViewData(User $user, Request $request): array
    {
        $accessibleIds = $user->getAccessibleLocationIds();
        $inventories = $this->queryInventories($user, $accessibleIds, $request);

        $locationsQuery = Location::orderBy('name');
        if ($accessibleIds) {
            $locationsQuery->whereIn('id', $accessibleIds);
        }

        $canAdjust = $user->level === Role::LEVEL_SUPER_ADMIN ||
            in_array($user->roles->first()?->code, [Role::CODE_WAREHOUSE_MGR, Role::CODE_BRANCH_MGR, Role::CODE_STAFF]);

        return [
            'inventories' => InventoryResource::collection($inventories),
            'locations' => $accessibleIds ? $locationsQuery->get(['id', 'name']) : Location::getForDropdown(),
            'products' => \Illuminate\Support\Facades\Cache::remember('all_products_dropdown', 3600, fn () => Product::orderBy('name')->get(['id', 'name', 'sku'])),
            'productTypes' => Type::getForGroup(Type::GROUP_PRODUCT),
            'filters' => (object) $request->only(['search', 'location_id', 'type_id', 'sort', 'product_id']),
            'canAdjustStock' => $canAdjust,
        ];
    }

    private function queryInventories(User $user, ?array $accessibleIds, Request $request): LengthAwarePaginator
    {
        $locId = $request->input('location_id');
        $prodId = $request->input('product_id');
        $typeId = $request->input('type_id');

        return Inventory::with(['product.type', 'location.type'])
            ->join('products', 'inventories.product_id', '=', 'products.id')
            ->select('inventories.*')
            ->whereHas('location', fn ($q) => $q->whereNull('deleted_at'))
            ->whereHas('product', fn ($q) => $q->whereNull('deleted_at')->accessibleBy($user))
            ->when($accessibleIds, fn ($q) => $q->whereIn('inventories.location_id', $accessibleIds))
            ->when($request->input('search'), fn ($q, $s) => $q->where(fn ($sub) => $sub->where('products.name', 'like', "%{$s}%")->orWhere('products.sku', 'like', "%{$s}%")))
            ->when($locId && $locId !== 'all', fn ($q) => $q->where('inventories.location_id', $locId))
            ->when($prodId && $prodId !== 'all', fn ($q) => $q->where('inventories.product_id', $prodId))
            ->when($typeId && $typeId !== 'all', fn ($q) => $q->whereHas('product', fn ($sq) => $sq->where('type_id', $typeId)))
            ->when($request->input('sort'), fn ($q, $sort) => $this->applySorting($q, $sort), fn ($q) => $q->orderBy('products.name', 'asc'))
            ->paginate(15)
            ->withQueryString();
    }

    private function applySorting($query, string $sort): void
    {
        $sorts = [
            'name_asc' => ['products.name', 'asc'],
            'name_desc' => ['products.name', 'desc'],
            'quantity_asc' => ['inventories.quantity', 'asc'],
            'quantity_desc' => ['inventories.quantity', 'desc'],
            'last_moved_desc' => ['inventories.updated_at', 'desc'],
            'last_moved_asc' => ['inventories.updated_at', 'asc'],
            'price_desc' => ['products.price', 'desc'],
            'price_asc' => ['products.price', 'asc'],
        ];
        $pair = $sorts[$sort] ?? ['products.name', 'asc'];
        $query->orderBy($pair[0], $pair[1]);
    }
}

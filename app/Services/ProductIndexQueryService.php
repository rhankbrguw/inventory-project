<?php

namespace App\Services;

use App\Http\Resources\ProductResource;
use App\Http\Resources\SupplierResource;
use App\Http\Resources\TypeResource;
use App\Models\Inventory;
use App\Models\Product;
use App\Models\Role;
use App\Models\Supplier;
use App\Models\Type;
use App\Models\User;
use Illuminate\Http\Request;

class ProductIndexQueryService
{
    public function getIndexData(User $user, Request $request): array
    {
        $products = Product::query()->withClassification()->with(['type', 'defaultSupplier'])
            ->when($user->level !== Role::LEVEL_SUPER_ADMIN && $user->locations->first()?->id, fn ($q) => $q->with(['inventories' => fn ($iq) => $iq->where('location_id', $user->locations->first()?->id)]))
            ->accessibleBy($user)
            ->when($request->input('search'), fn ($q, $s) => $q->where(fn ($sub) => $sub->where('name', 'like', "%{$s}%")->orWhere('sku', 'like', "%{$s}%")))
            ->when($request->input('type_id') && $request->input('type_id') !== 'all', fn ($q) => $q->where('type_id', $request->input('type_id')))
            ->when($request->input('status'), fn ($q, $st) => $st === 'active' ? $q->whereNull('deleted_at') : ($st === 'inactive' ? $q->whereNotNull('deleted_at') : null))
            ->when($request->input('sort'), fn ($q, $srt) => $this->applySort($q, $srt), fn ($q) => $q->latest())
            ->withTrashed()
            ->paginate(15)
            ->withQueryString();

        return [
            'products' => ProductResource::collection($products),
            'allProducts' => \Illuminate\Support\Facades\Cache::remember('all_products_dropdown', 3600, fn () => Product::orderBy('name')->get(['id', 'name', 'sku'])),
            'suppliers' => SupplierResource::collection(\Illuminate\Support\Facades\Cache::remember('suppliers_dropdown_'.($user->level === Role::LEVEL_SUPER_ADMIN ? 'all' : ($user->locations->first()?->id ?? 0)), 600, fn () => Supplier::accessibleBy($user)->orderBy('name')->get())),
            'productTypes' => TypeResource::collection(Type::getForGroup(Type::GROUP_PRODUCT)),
            'salesChannels' => TypeResource::collection(Type::getForGroup(Type::GROUP_SALES_CHANNEL)),
            'filters' => (object) $request->only(['search', 'status', 'sort', 'type_id']),
        ];
    }

    private function applySort($query, string $sort): void
    {
        $sorts = [
            'newest' => fn ($q) => $q->latest(),
            'oldest' => fn ($q) => $q->oldest(),
            'price_desc' => fn ($q) => $q->orderBy('price', 'desc'),
            'price_asc' => fn ($q) => $q->orderBy('price', 'asc'),
        ];
        ($sorts[$sort] ?? $sorts['newest'])($query);
    }

    public function getEditData(Product $product, User $user): array
    {
        $localOverride = null;
        if ($user->level !== Role::LEVEL_SUPER_ADMIN && $user->locations->first()?->id) {
            $localOverride = Inventory::with('localSupplier')->where('product_id', $product->id)->where('location_id', $user->locations->first()?->id)->first();
        }

        return [
            'product' => ProductResource::make($product),
            'localOverride' => $localOverride ? [
                'selling_price' => $localOverride->selling_price,
                'local_supplier_id' => $localOverride->local_supplier_id,
                'local_supplier' => $localOverride->localSupplier ? ['id' => $localOverride->localSupplier->id, 'name' => $localOverride->localSupplier->name] : null,
                'channel_prices_override' => $localOverride->channel_prices_override ?? [],
            ] : null,
            'types' => Type::getForGroup(Type::GROUP_PRODUCT),
            'suppliers' => Supplier::accessibleBy($user)->orderBy('name')->get(['id', 'name']),
            'validUnits' => Product::VALID_UNITS,
            'salesChannels' => Type::getForGroup(Type::GROUP_SALES_CHANNEL),
        ];
    }
}

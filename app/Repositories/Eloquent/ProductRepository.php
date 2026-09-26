<?php

namespace App\Repositories\Eloquent;

use App\Models\Product;
use App\Models\Role;
use App\Repositories\Contracts\ProductRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class ProductRepository implements ProductRepositoryInterface
{
    public function findById(int $id, bool $withTrashed = false): ?Product
    {
        return $withTrashed ? Product::withTrashed()->find($id) : Product::find($id);
    }

    public function findBySku(string $sku): ?Product
    {
        return Product::where('sku', $sku)->first();
    }

    public function paginate(int $perPage = 15, ?string $search = null, ?int $typeId = null): LengthAwarePaginator
    {
        return Product::with(['type', 'defaultSupplier'])
            ->when($search, fn ($q, $s) => $q->where(fn ($sub) => $sub->where('name', 'like', "%{$s}%")->orWhere('sku', 'like', "%{$s}%")))
            ->when($typeId, fn ($q, $t) => $q->where('type_id', $t))
            ->orderBy('name')
            ->paginate($perPage);
    }

    public function searchAccessibleProducts(mixed $user, string $query, int $limit = 20): Collection
    {
        if ($user instanceof \App\Models\User && $user->level !== Role::LEVEL_SUPER_ADMIN) {
            $locationIds = $user->getAccessibleLocationIds();
        } else {
            $locationIds = null;
        }

        return Product::query()->select('id', 'name', 'sku', 'unit', 'price', 'image_path')
            ->when($locationIds !== null, function ($q) use ($locationIds) {
                $q->whereNull('location_id')
                    ->orWhereIn('location_id', $locationIds)
                    ->orWhereHas('inventories', fn ($iq) => $iq->whereIn('location_id', $locationIds));
            })
            ->whereNull('deleted_at')
            ->where(fn ($q) => $q->where('name', 'like', "%{$query}%")->orWhere('sku', 'like', "%{$query}%"))
            ->limit($limit)
            ->get();
    }

    public function create(array $attributes): Product
    {
        return Product::create($attributes);
    }

    public function update(Product $product, array $attributes): bool
    {
        return $product->update($attributes);
    }

    public function delete(Product $product): bool
    {
        return (bool) $product->delete();
    }

    public function restore(Product $product): bool
    {
        return (bool) $product->restore();
    }
}

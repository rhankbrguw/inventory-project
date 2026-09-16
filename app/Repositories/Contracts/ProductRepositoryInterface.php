<?php

namespace App\Repositories\Contracts;

use App\Models\Product;
use Illuminate\Pagination\LengthAwarePaginator;

interface ProductRepositoryInterface
{
    public function findById(int $id, bool $withTrashed = false): ?Product;

    public function findBySku(string $sku): ?Product;

    public function paginate(int $perPage = 15, ?string $search = null, ?int $typeId = null): LengthAwarePaginator;

    public function searchAccessibleProducts(mixed $user, string $query, int $limit = 20): \Illuminate\Support\Collection;

    public function create(array $attributes): Product;

    public function update(Product $product, array $attributes): bool;

    public function delete(Product $product): bool;

    public function restore(Product $product): bool;
}

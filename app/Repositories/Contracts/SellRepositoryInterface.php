<?php

namespace App\Repositories\Contracts;

use App\Models\Sell;
use Illuminate\Pagination\LengthAwarePaginator;

interface SellRepositoryInterface
{
    public function findById(int $id): ?Sell;

    public function paginate(int $perPage = 15, array $filters = []): LengthAwarePaginator;

    public function create(array $attributes): Sell;

    public function updateStatus(Sell $sell, string $status, array $attributes = []): bool;
}

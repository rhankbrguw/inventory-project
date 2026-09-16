<?php

namespace App\Repositories\Contracts;

use App\Models\Purchase;
use Illuminate\Pagination\LengthAwarePaginator;

interface PurchaseRepositoryInterface
{
    public function findById(int $id): ?Purchase;

    public function paginate(int $perPage = 15, array $filters = []): LengthAwarePaginator;

    public function create(array $attributes): Purchase;

    public function updateStatus(Purchase $purchase, string $status, array $attributes = []): bool;
}

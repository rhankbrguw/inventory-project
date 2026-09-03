<?php

namespace App\Repositories\Contracts;

use App\Models\StockTransfer;
use Illuminate\Pagination\LengthAwarePaginator;

interface StockTransferRepositoryInterface
{
    public function findById(int $id): ?StockTransfer;

    public function paginate(int $perPage = 15, array $filters = []): LengthAwarePaginator;

    public function create(array $attributes): StockTransfer;

    public function updateStatus(StockTransfer $transfer, string $status, array $attributes = []): bool;
}

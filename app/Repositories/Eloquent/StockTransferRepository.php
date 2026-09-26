<?php

namespace App\Repositories\Eloquent;

use App\Models\StockTransfer;
use App\Repositories\Contracts\StockTransferRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class StockTransferRepository implements StockTransferRepositoryInterface
{
    public function findById(int $id): ?StockTransfer
    {
        return StockTransfer::with(['fromLocation', 'toLocation', 'user'])->find($id);
    }

    public function paginate(int $perPage = 15, array $filters = []): LengthAwarePaginator
    {
        return StockTransfer::with(['fromLocation', 'toLocation', 'user'])
            ->latest('transfer_date')
            ->paginate($perPage);
    }

    public function create(array $attributes): StockTransfer
    {
        return StockTransfer::create($attributes);
    }

    public function updateStatus(StockTransfer $transfer, string $status, array $attributes = []): bool
    {
        return $transfer->update(array_merge(['status' => $status], $attributes));
    }
}

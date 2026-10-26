<?php

namespace App\Repositories\Eloquent;

use App\Models\Sell;
use App\Repositories\Contracts\SellRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class SellRepository implements SellRepositoryInterface
{
    public function findById(int $id): ?Sell
    {
        return Sell::with(['items.product', 'customer', 'location', 'user', 'installments'])->find($id);
    }

    public function paginate(int $perPage = 15, array $filters = []): LengthAwarePaginator
    {
        return Sell::with(['customer', 'location', 'user'])
            ->when($filters['location_id'] ?? null, fn ($q, $loc) => $q->where('location_id', $loc))
            ->when($filters['status'] ?? null, fn ($q, $st) => $q->where('status', $st))
            ->latest('transaction_date')
            ->paginate($perPage);
    }

    public function create(array $attributes): Sell
    {
        return Sell::create($attributes);
    }

    public function updateStatus(Sell $sell, string $status, array $attributes = []): bool
    {
        return $sell->update(array_merge(['status' => $status], $attributes));
    }
}

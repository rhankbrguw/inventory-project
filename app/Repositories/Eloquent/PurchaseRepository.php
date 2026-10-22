<?php

namespace App\Repositories\Eloquent;

use App\Models\Purchase;
use App\Repositories\Contracts\PurchaseRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class PurchaseRepository implements PurchaseRepositoryInterface
{
    public function findById(int $id): ?Purchase
    {
        return Purchase::with(['items.product', 'supplier', 'location', 'user'])->find($id);
    }

    public function paginate(int $perPage = 15, array $filters = []): LengthAwarePaginator
    {
        return Purchase::with(['supplier', 'location', 'user'])
            ->when($filters['location_id'] ?? null, fn ($q, $loc) => $q->where('location_id', $loc))
            ->when($filters['status'] ?? null, fn ($q, $st) => $q->where('status', $st))
            ->latest('transaction_date')
            ->paginate($perPage);
    }

    public function create(array $attributes): Purchase
    {
        return Purchase::create($attributes);
    }

    public function updateStatus(Purchase $purchase, string $status, array $attributes = []): bool
    {
        return $purchase->update(array_merge(['status' => $status], $attributes));
    }
}

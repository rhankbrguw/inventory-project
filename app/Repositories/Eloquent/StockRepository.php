<?php

namespace App\Repositories\Eloquent;

use App\Models\Inventory;
use App\Models\StockMovement;
use App\Repositories\Contracts\StockRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class StockRepository implements StockRepositoryInterface
{
    public function getInventory(int $productId, int $locationId): ?Inventory
    {
        return Inventory::where('product_id', $productId)
            ->where('location_id', $locationId)
            ->first();
    }

    public function getOrCreateInventory(int $productId, int $locationId): Inventory
    {
        return Inventory::firstOrCreate(
            ['product_id' => $productId, 'location_id' => $locationId],
            ['quantity' => 0]
        );
    }

    public function updateQuantity(Inventory $inventory, int $delta): bool
    {
        $inventory->quantity += $delta;

        return $inventory->save();
    }

    public function createMovement(array $attributes): StockMovement
    {
        return StockMovement::create($attributes);
    }

    public function paginateMovements(int $perPage = 15, array $filters = []): LengthAwarePaginator
    {
        return StockMovement::with(['product', 'location', 'user', 'reference'])
            ->when($filters['location_id'] ?? null, fn ($q, $loc) => $q->where('location_id', $loc))
            ->when($filters['product_id'] ?? null, fn ($q, $prod) => $q->where('product_id', $prod))
            ->when($filters['type'] ?? null, fn ($q, $type) => $q->where('type', $type))
            ->latest('id')
            ->paginate($perPage);
    }
}

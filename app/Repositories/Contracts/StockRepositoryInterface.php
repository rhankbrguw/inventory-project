<?php

namespace App\Repositories\Contracts;

use App\Models\Inventory;
use App\Models\StockMovement;
use Illuminate\Pagination\LengthAwarePaginator;

interface StockRepositoryInterface
{
    public function getInventory(int $productId, int $locationId): ?Inventory;

    public function getOrCreateInventory(int $productId, int $locationId): Inventory;

    public function updateQuantity(Inventory $inventory, int $delta): bool;

    public function createMovement(array $attributes): StockMovement;

    public function paginateMovements(int $perPage = 15, array $filters = []): LengthAwarePaginator;
}

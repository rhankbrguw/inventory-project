<?php

namespace App\Services;

use App\Http\Resources\ProductResource;
use App\Models\Location;
use App\Models\Product;
use App\Models\StockTransfer;
use App\Models\User;

class StockTransferViewDataService
{
    public function getCreateViewData(User $user): array
    {
        $accessibleIds = $user->getAccessibleLocationIds();
        $sourceLocations = $this->getSourceLocations($user, $accessibleIds);
        $destinationLocations = Location::orderBy('name')->get(['id', 'name']);
        $products = $this->getAvailableProducts($user, $accessibleIds);

        return [
            'source_locations' => $sourceLocations,
            'destination_locations' => $destinationLocations,
            'products' => ProductResource::collection($products),
        ];
    }

    private function getSourceLocations(User $user, ?array $accessibleIds): \Illuminate\Support\Collection
    {
        $query = Location::orderBy('name')->with('type');
        if ($accessibleIds) {
            $query->whereIn('id', $accessibleIds);
        }

        return $query->get()
            ->filter(fn (Location $loc) => $user->can('createAtLocation', [StockTransfer::class, $loc->id]))
            ->map(fn (Location $loc) => ['id' => $loc->id, 'name' => $loc->name])
            ->values();
    }

    private function getAvailableProducts(User $user, ?array $accessibleIds): \Illuminate\Support\Collection
    {
        $query = Product::accessibleBy($user)
            ->whereNull('deleted_at')
            ->with([
                'inventories' => fn ($q) => $q->where('quantity', '>', 0),
                'inventories.location:id,name',
            ])->orderBy('name');

        if ($accessibleIds) {
            $query->whereHas('inventories', fn ($q) => $q->whereIn('location_id', $accessibleIds)->where('quantity', '>', 0));
        }

        return $query->get()->map(function (Product $product) {
            $product->locations = $product->inventories->map(fn ($inv) => [
                'id' => $inv->location->id,
                'name' => $inv->location->name,
                'quantity' => $inv->quantity,
            ]);

            return $product;
        });
    }
}

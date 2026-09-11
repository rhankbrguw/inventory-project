<?php

namespace App\Services;

use App\Models\Inventory;
use App\Models\Location;
use App\Models\Product;
use App\Models\Role;
use App\Models\User;
use App\Repositories\Contracts\ProductRepositoryInterface;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;

class ProductService
{
    public function __construct(
        protected ProductPriceService $priceService,
        protected ProductRepositoryInterface $productRepository,
    ) {}

    public function createProduct(array $validated, User $user, ?UploadedFile $imageFile): Product
    {
        $validated['location_id'] = $user->level === Role::LEVEL_SUPER_ADMIN ? null : $user->locations->first()?->id;
        $channelPrices = $validated['channel_prices'] ?? [];
        $supplierIds = $validated['suppliers'] ?? [];
        unset($validated['channel_prices'], $validated['suppliers'], $validated['image']);

        if ($imageFile) {
            $validated['image_path'] = $this->priceService->handleImageUpload($imageFile);
        }

        return DB::transaction(function () use ($validated, $supplierIds, $channelPrices, $user) {
            $product = $this->productRepository->create($validated);
            $this->syncProductSuppliers($product, $supplierIds);
            $this->priceService->syncChannelPrices($product, $channelPrices);
            $this->initializeInventories($product, $user);

            return $product;
        });
    }

    public function updateProduct(Product $product, array $validated, User $user, ?UploadedFile $imageFile): Product
    {
        return DB::transaction(function () use ($product, $validated, $imageFile, $user) {
            if ($user->level === Role::LEVEL_SUPER_ADMIN) {
                $this->updateAsSuperAdmin($product, $validated, $imageFile);
            } else {
                $this->updateAsLocalUser($product, $validated, $imageFile, $user);
            }

            return $product;
        });
    }

    private function syncProductSuppliers(Product $product, array $supplierIds): void
    {
        if (! empty($supplierIds)) {
            $product->suppliers()->sync($supplierIds);
        }
        if ($product->default_supplier_id && ! in_array($product->default_supplier_id, $supplierIds)) {
            $product->suppliers()->attach($product->default_supplier_id);
        }
    }

    private function initializeInventories(Product $product, User $user): void
    {
        $targets = $user->level === Role::LEVEL_SUPER_ADMIN ? Location::pluck('id')->toArray() : ($user->getAccessibleLocationIds() ?? []);
        foreach ($targets as $locationId) {
            if ($locationId !== 0) {
                Inventory::firstOrCreate(['product_id' => $product->id, 'location_id' => $locationId], ['quantity' => 0, 'average_cost' => 0]);
            }
        }
    }

    private function updateAsSuperAdmin(Product $product, array $validated, ?UploadedFile $imageFile): void
    {
        $channelPrices = $validated['channel_prices'] ?? [];
        $supplierIds = $validated['suppliers'] ?? [];
        unset($validated['channel_prices'], $validated['suppliers'], $validated['image']);

        if ($imageFile) {
            $validated['image_path'] = $this->priceService->handleImageUpload($imageFile, $product->image_path);
        }

        $this->productRepository->update($product, $validated);
        $this->syncProductSuppliers($product, $supplierIds);
        $this->priceService->syncChannelPrices($product, $channelPrices);
    }

    private function updateAsLocalUser(Product $product, array $validated, ?UploadedFile $imageFile, User $user): void
    {
        $locationId = $user->locations->first()?->id;
        if ($product->location_id === $locationId) {
            $this->updateAsSuperAdmin($product, $validated, $imageFile);
        }
        if ($locationId) {
            $this->priceService->syncLocalInventory($product, $locationId, $validated);
        }
    }
}

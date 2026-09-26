<?php

namespace App\Services;

use App\Models\Inventory;
use App\Models\Product;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class ProductPriceService
{
    public function syncChannelPrices(Product $product, array $channelPrices): void
    {
        foreach ($channelPrices as $channelId => $price) {
            if ($price !== null && $price !== '') {
                $product->prices()->updateOrCreate(['type_id' => $channelId], ['price' => $price]);
            } else {
                $product->prices()->where('type_id', $channelId)->delete();
            }
        }
    }

    public function handleImageUpload(?UploadedFile $imageFile, ?string $oldPath = null): ?string
    {
        if (! $imageFile) {
            return $oldPath;
        }
        if ($oldPath) {
            Storage::disk('public')->delete($oldPath);
        }

        return $imageFile->store('products', 'public');
    }

    public function syncLocalInventory(Product $product, int $locationId, array $validated): void
    {
        $inventory = Inventory::firstOrCreate(
            ['product_id' => $product->id, 'location_id' => $locationId],
            ['quantity' => 0, 'average_cost' => 0]
        );

        if (isset($validated['price'])) {
            $inventory->selling_price = $validated['price'];
        }
        if (array_key_exists('default_supplier_id', $validated)) {
            $inventory->local_supplier_id = $validated['default_supplier_id'] ?: null;
        }
        if (isset($validated['channel_prices'])) {
            $inventory->channel_prices_override = $validated['channel_prices'];
        }
        $inventory->save();
    }
}

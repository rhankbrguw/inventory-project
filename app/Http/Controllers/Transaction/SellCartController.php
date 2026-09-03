<?php

namespace App\Http\Controllers\Transaction;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSellCartItemRequest;
use App\Http\Requests\UpdateSellCartItemRequest;
use App\Models\Product;
use App\Models\SellCartItem;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;

class SellCartController extends Controller
{
    public function store(StoreSellCartItemRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $effectivePrice = $this->resolveEffectivePrice($validated['product_id'], $validated['location_id'], $validated['sales_channel_id'] ?? null);
        $this->addOrUpdateCartItem($request->user()->id, $validated, $effectivePrice);

        return Redirect::back();
    }

    private function resolveEffectivePrice(int $productId, int $locationId, ?int $channelId): float
    {
        $product = Product::with('inventories', 'prices')->findOrFail($productId);
        $effectivePrice = $product->getEffectivePrice($locationId);

        if ($channelId) {
            $inventory = $product->inventories->where('location_id', $locationId)->first();
            if ($inventory && isset($inventory->channel_prices_override[$channelId])) {
                return (float) $inventory->channel_prices_override[$channelId];
            }
            $channelPrice = $product->prices->where('type_id', $channelId)->first();
            if ($channelPrice) {
                return (float) $channelPrice->price;
            }
        }

        return (float) $effectivePrice;
    }

    private function addOrUpdateCartItem(int $userId, array $cartItemPayload, float $effectivePrice): void
    {
        $item = SellCartItem::where('user_id', $userId)->where('location_id', $cartItemPayload['location_id'])
            ->where('product_id', $cartItemPayload['product_id'])->where('sales_channel_type_id', $cartItemPayload['sales_channel_id'] ?? null)->first();

        if ($item) {
            $item->increment('quantity', $cartItemPayload['quantity']);
            $item->update(['sell_price' => $effectivePrice]);
        } else {
            SellCartItem::create([
                'user_id' => $userId, 'location_id' => $cartItemPayload['location_id'], 'product_id' => $cartItemPayload['product_id'],
                'quantity' => $cartItemPayload['quantity'], 'sell_price' => $effectivePrice, 'sales_channel_type_id' => $cartItemPayload['sales_channel_id'] ?? null,
            ]);
        }
    }

    public function update(UpdateSellCartItemRequest $request, SellCartItem $cartItem): RedirectResponse
    {
        $this->authorize('update', $cartItem);
        $cartItem->update($request->validated());

        return Redirect::back();
    }

    public function updatePricesByChannel(Request $request): RedirectResponse
    {
        $validated = $request->validate(['location_id' => ['required', 'integer', 'exists:locations,id'], 'sales_channel_id' => ['required', 'integer', 'exists:types,id']]);
        $items = $request->user()->sellCartItems()->where('location_id', $validated['location_id'])->with('product.prices')->get();
        foreach ($items as $item) {
            $item->update(['sell_price' => $item->product->getPriceForChannel($validated['sales_channel_id'])]);
        }

        return Redirect::back();
    }

    public function destroyItem(SellCartItem $cartItem): RedirectResponse
    {
        $this->authorize('delete', $cartItem);
        $cartItem->delete();

        return Redirect::back();
    }

    public function destroyLocation(Request $request): RedirectResponse
    {
        $locationPayload = $request->validate(['location_id' => ['required', 'integer', 'exists:locations,id']]);
        Auth::user()->sellCartItems()->where('location_id', $locationPayload['location_id'])->delete();

        return Redirect::back();
    }
}

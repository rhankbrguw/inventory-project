<?php

namespace App\Http\Controllers\Transaction;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateSellCartItemRequest;
use App\Models\SellCartItem;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;

class SellCartController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'location_id' => 'required|exists:locations,id',
            'quantity' => 'required|numeric|min:0.01',
            'sell_price' => 'required|numeric',
            'sales_channel_id' => 'nullable|exists:types,id',
        ]);

        $user = $request->user();

        $product = \App\Models\Product::with('inventories')->findOrFail($validated['product_id']);
        $locationId = $validated['location_id'];
        $channelId = $validated['sales_channel_id'];

        $effectivePrice = $product->getEffectivePrice($locationId);

        if ($channelId) {
            $inventory = $product->inventories->where('location_id', $locationId)->first();
            if ($inventory && isset($inventory->channel_prices_override[$channelId])) {
                $effectivePrice = $inventory->channel_prices_override[$channelId];
            } else {
                $channelPrice = $product->prices->where('type_id', $channelId)->first();
                if ($channelPrice) {
                    $effectivePrice = $channelPrice->price;
                }
            }
        }

        $cartItem = SellCartItem::where('user_id', $user->id)
            ->where('location_id', $validated['location_id'])
            ->where('product_id', $validated['product_id'])
            ->where('sales_channel_type_id', $validated['sales_channel_id'] ?? null)
            ->first();

        if ($cartItem) {
            $cartItem->increment('quantity', $validated['quantity']);
            $cartItem->update(['sell_price' => $effectivePrice]);
        } else {
            SellCartItem::create([
                'user_id' => $user->id,
                'location_id' => $validated['location_id'],
                'product_id' => $validated['product_id'],
                'quantity' => $validated['quantity'],
                'sell_price' => $effectivePrice,
                'sales_channel_type_id' => $validated['sales_channel_id'] ?? null,
            ]);
        }

        return back();
    }

    public function update(
        UpdateSellCartItemRequest $request,
        SellCartItem $cartItem,
    ): RedirectResponse {
        $validated = $request->validated();
        $cartItem->update($validated);
        return Redirect::back();
    }

    public function updatePricesByChannel(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'location_id' => ['required', 'integer', 'exists:locations,id'],
            'sales_channel_id' => ['required', 'integer', 'exists:types,id'],
        ]);
        $user = $request->user();
        $cartItems = $user->sellCartItems()
            ->where('location_id', $validated['location_id'])
            ->with('product.prices')
            ->get();
        foreach ($cartItems as $item) {
            $newPrice = $item->product->getPriceForChannel($validated['sales_channel_id']);
            $item->update(['sell_price' => $newPrice]);
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
        $validated = $request->validate([
            'location_id' => ['required', 'integer', 'exists:locations,id'],
        ]);
        Auth::user()
            ->sellCartItems()
            ->where('location_id', $validated['location_id'])
            ->delete();
        return Redirect::back();
    }
}

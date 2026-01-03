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
        $user = $request->user();

        $product = Product::findOrFail($validated['product_id']);

        $validated['quantity'] = $validated['quantity'] ?? 1.0;
        $sellPrice = $validated['sell_price'] ?? $product->price;

        SellCartItem::create([
            'user_id' => $user->id,
            'location_id' => $validated['location_id'],
            'product_id' => $product->id,
            'quantity' => $validated['quantity'],
            'sell_price' => $sellPrice,
        ]);

        return Redirect::back();
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
            'sales_channel_id' => ['required', 'integer', 'exists:sales_channels,id'],
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

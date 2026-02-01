<?php

namespace App\Http\Controllers\Transaction;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePurchaseCartItemRequest;
use App\Http\Requests\UpdatePurchaseCartItemRequest;
use App\Models\Product;
use App\Models\PurchaseCartItem;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;

class PurchaseCartController extends Controller
{
    public function store(StorePurchaseCartItemRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $user = $request->user();
        $product = Product::findOrFail($validated['product_id']);
        $quantity = $validated['quantity'] ?? 1.0;
        $cost = $validated['cost_per_unit'] ?? ($product->price ?? 0);
        $supplierId = $validated['supplier_id'] ?? null;
        $existingItem = PurchaseCartItem::where('user_id', $user->id)
            ->where('product_id', $product->id)
            ->where('supplier_id', $supplierId)
            ->first();
        if ($existingItem) {
            $existingItem->increment('quantity', $quantity);
        } else {
            PurchaseCartItem::create([
                'user_id' => $user->id,
                'product_id' => $product->id,
                'supplier_id' => $supplierId,
                'quantity' => $quantity,
                'cost_per_unit' => $cost,
            ]);
        }
        return Redirect::back();
    }

    public function update(
        UpdatePurchaseCartItemRequest $request,
        PurchaseCartItem $cartItem,
    ): RedirectResponse {
        $validated = $request->validated();
        $cartItem->update($validated);
        return Redirect::back();
    }

    public function destroyItem(PurchaseCartItem $cartItem): RedirectResponse
    {
        $this->authorize('delete', $cartItem);
        $cartItem->delete();
        return Redirect::back();
    }

    public function destroySupplier(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'supplier_id' => [
                'nullable',
                'integer',
                'exists:suppliers,id',
            ],
        ]);
        Auth::user()
            ->purchaseCartItems()
            ->where('supplier_id', $validated['supplier_id'])
            ->delete();
        return Redirect::back();
    }

    public function destroyAll(): RedirectResponse
    {
        Auth::user()->purchaseCartItems()->delete();
        return Redirect::back();
    }
}

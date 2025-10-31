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
    public function store(
        StorePurchaseCartItemRequest $request,
    ): RedirectResponse {
        $validated = $request->validated();
        $user = $request->user();

        $product = Product::findOrFail($validated["product_id"]);
        $validated["quantity"] = $validated["quantity"] ?? 1.0;
        $validated["cost_per_unit"] =
            $validated["cost_per_unit"] ?? ($product->price ?? 0);

        PurchaseCartItem::create([
            "user_id" => $user->id,
            "product_id" => $product->id,
            "supplier_id" => $validated["supplier_id"],
            "quantity" => $validated["quantity"],
            "cost_per_unit" => $validated["cost_per_unit"],
        ]);

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
        $this->authorize("delete", $cartItem);
        $cartItem->delete();

        return Redirect::back();
    }

    public function destroySupplier(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            "supplier_id" => ["required", "integer", "exists:suppliers,id"],
        ]);

        Auth::user()
            ->purchaseCartItems()
            ->where("supplier_id", $validated["supplier_id"])
            ->delete();

        return Redirect::back();
    }
}

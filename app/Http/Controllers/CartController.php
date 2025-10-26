<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCartItemRequest;
use App\Http\Requests\UpdateCartItemRequest;
use App\Models\CartItem;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function store(StoreCartItemRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $user = $request->user();

        $cartItem = $user
            ->cartItems()
            ->where("product_id", $validated["product_id"])
            ->where("supplier_id", $validated["supplier_id"])
            ->first();

        if ($cartItem) {
            $cartItem->increment("quantity", $validated["quantity"]);
        } else {
            $user->cartItems()->create([
                "product_id" => $validated["product_id"],
                "supplier_id" => $validated["supplier_id"],
                "quantity" => $validated["quantity"],
            ]);
        }

        return Redirect::back()->with(
            "success",
            "Item ditambahkan ke keranjang.",
        );
    }

    public function update(
        UpdateCartItemRequest $request,
        CartItem $cartItem,
    ): RedirectResponse {
        $validated = $request->validated();

        $cartItem->update($validated);

        return Redirect::back()->with("success", "Jumlah item diperbarui.");
    }

    public function destroy(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            "supplier_id" => ["required", "integer", "exists:suppliers,id"],
        ]);

        $request
            ->user()
            ->cartItems()
            ->where("supplier_id", $validated["supplier_id"])
            ->delete();

        return Redirect::back()->with(
            "success",
            "Item keranjang berhasil dihapus.",
        );
    }

    public function destroyItem(CartItem $cartItem): RedirectResponse
    {
        $this->authorize("delete", $cartItem);

        $cartItem->delete();

        return Redirect::back()->with("success", "Item berhasil dihapus.");
    }
}

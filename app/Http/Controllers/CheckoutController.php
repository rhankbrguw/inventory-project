<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCheckoutRequest;
use App\Models\Inventory;
use App\Models\Purchase;
use App\Models\Type;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;

class CheckoutController extends Controller
{
    public function store(StoreCheckoutRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $user = $request->user();
        $supplierId = $validated["supplier_id"];

        $cartItems = $user
            ->cartItems()
            ->where("supplier_id", $supplierId)
            ->with("product")
            ->get();

        if ($cartItems->isEmpty()) {
            return Redirect::back()->with(
                "error",
                "Keranjang Anda kosong untuk supplier ini.",
            );
        }

        $totalCost = $cartItems->sum(function ($item) {
            return $item->quantity * $item->product->price;
        });

        $purchaseType = Type::where("group", Type::GROUP_TRANSACTION)
            ->where("name", "Pembelian")
            ->firstOrFail();

        DB::transaction(function () use (
            $validated,
            $totalCost,
            $purchaseType,
            $cartItems,
            $user,
            $supplierId,
        ) {
            $purchase = Purchase::create([
                "type_id" => $purchaseType->id,
                "location_id" => $validated["location_id"],
                "supplier_id" => $supplierId,
                "user_id" => $user->id,
                "reference_code" => "PO-" . now()->format("Ymd-His"),
                "transaction_date" => Carbon::parse(
                    $validated["transaction_date"],
                )->format("Y-m-d"),
                "notes" => $validated["notes"],
                "payment_method_type_id" =>
                    $validated["payment_method_type_id"] ?? null,
                "status" => "completed",
                "total_cost" => $totalCost,
            ]);

            foreach ($cartItems as $item) {
                $purchase->stockMovements()->create([
                    "product_id" => $item->product_id,
                    "supplier_id" => $supplierId,
                    "location_id" => $validated["location_id"],
                    "type" => "purchase",
                    "quantity" => $item->quantity,
                    "cost_per_unit" => $item->product->price,
                    "notes" => $validated["notes"],
                ]);

                $inventory = Inventory::firstOrCreate(
                    [
                        "product_id" => $item->product_id,
                        "location_id" => $validated["location_id"],
                    ],
                    ["quantity" => 0, "average_cost" => 0],
                );

                $oldQty = $inventory->quantity;
                $oldAvgCost = $inventory->average_cost;
                $newQty = $item->quantity;
                $newCost = $item->product->price;

                $newTotalQty = $oldQty + $newQty;
                $newAvgCost =
                    ($oldQty * $oldAvgCost + $newQty * $newCost) /
                    ($newTotalQty > 0 ? $newTotalQty : 1);

                $inventory->update([
                    "quantity" => $newTotalQty,
                    "average_cost" => $newAvgCost,
                ]);
            }

            $user->cartItems()->where("supplier_id", $supplierId)->delete();
        });

        return Redirect::route("transactions.purchases.create")->with(
            "success",
            "Transaksi pembelian berhasil disimpan.",
        );
    }
}

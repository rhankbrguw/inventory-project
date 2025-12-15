<?php

use App\Http\Controllers\Transaction\PurchaseController;
use App\Http\Controllers\Transaction\SellController;
use App\Http\Controllers\Transaction\TransactionController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LocationsController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Auth\SetupController;
use App\Http\Controllers\StockController;
use App\Http\Controllers\StockMovementController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\TypeController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\Transaction\PurchaseCartController;
use App\Http\Controllers\Transaction\SellCartController;
use App\Models\Customer;
use App\Models\Location;
use App\Models\Product;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('guest')->group(function () {
    Route::get('/setup', [SetupController::class, 'index'])->name('setup.index');
    Route::post('/setup', [SetupController::class, 'store'])->name('setup.store');
});

Route::get("/", function () {
    return Inertia::render("Welcome", [
        "canLogin" => Route::has("login"),
        "canRegister" => Route::has("register"),
    ]);
})->middleware('ensure.setup');

Route::middleware(["auth", "verified", "ensure.setup"])->group(function () {
    Route::get("/dashboard", DashboardController::class)->name("dashboard");

    Route::get("/profile", [ProfileController::class, "edit"])->name("profile.edit");
    Route::patch("/profile", [ProfileController::class, "update"])->name("profile.update");
    Route::delete("/profile", [ProfileController::class, "destroy"])->name("profile.destroy");
    Route::put("password", [ProfileController::class, "updatePassword"])->name("password.update");

    Route::get("/api/inventory/quantity", [StockController::class, "getQuantity"])->name("api.inventory.quantity");

    Route::prefix("purchase-cart")->name("purchase.cart.")->controller(PurchaseCartController::class)->group(function () {
        Route::post("/", "store")->name("store");
        Route::patch("/{cartItem}", "update")->name("update");
        Route::delete("/", "destroySupplier")->name("destroy.supplier");
        Route::delete("/{cartItem}", "destroyItem")->name("destroy.item");
    });

    Route::prefix("sell-cart")->name("sell.cart.")->controller(SellCartController::class)->group(function () {
        Route::post("/", "store")->name("store");
        Route::patch("/{cartItem}", "update")->name("update");
        Route::delete("/", "destroyLocation")->name("destroy.location");
        Route::delete("/{cartItem}", "destroyItem")->name("destroy.item");
    });

    // Admin Only Resources
    Route::middleware(["can:viewAny," . User::class])->group(function () {
        Route::resource("users", UserController::class)->except(["destroy"]);
        Route::delete("users/{user}", [UserController::class, "destroy"])->name("users.destroy");

        // Types management
        Route::resource("types", TypeController::class)->except(['store']);
    });

    Route::post("/types", [TypeController::class, "store"])->name("types.store");

    Route::middleware(["can:viewAny," . Location::class])->group(function () {
        Route::get("/locations", [LocationsController::class, "index"])->name("locations.index");

        Route::get("/locations/create", [LocationsController::class, "create"])->name("locations.create");
        Route::post("/locations", [LocationsController::class, "store"])->name("locations.store");
        Route::get("/locations/{location}/edit", [LocationsController::class, "edit"])->name("locations.edit")->withTrashed();
        Route::patch("/locations/{location}", [LocationsController::class, "update"])->name("locations.update")->withTrashed();
        Route::delete("/locations/{location}", [LocationsController::class, "destroy"])->name("locations.destroy");
        Route::post("/locations/{location}/restore", [LocationsController::class, "restore"])->name("locations.restore")->withTrashed();
    });

    Route::middleware(["can:viewAny," . Customer::class])->group(function () {
        Route::resource("customers", CustomerController::class);
    });

    Route::middleware(["can:viewAny," . Supplier::class])->group(function () {
        Route::resource("suppliers", SupplierController::class);
    });

    // Products (Managers)
    Route::middleware(["can:viewAny," . Product::class])->group(function () {
        Route::get("/products", [ProductController::class, "index"])->name("products.index");
        Route::get("/products/create", [ProductController::class, "create"])->name("products.create");
        Route::post("/products", [ProductController::class, "store"])->name("products.store");
        Route::get("/products/{product}/edit", [ProductController::class, "edit"])->name("products.edit")->withTrashed();
        Route::patch("/products/{product}", [ProductController::class, "update"])->name("products.update")->withTrashed();
        Route::delete("/products/{product}", [ProductController::class, "destroy"])->name("products.destroy")->withTrashed();
        Route::post("/products/{product}/restore", [ProductController::class, "restore"])->name("products.restore")->withTrashed();
    });

    Route::get("/transactions", [TransactionController::class, "index"])->name("transactions.index");

    // Purchases (Level <= 10)
    Route::post("/transactions/purchases", [PurchaseController::class, "store"])->name("transactions.purchases.store");
    Route::get("/transactions/purchases/create", [PurchaseController::class, "create"])->name("transactions.purchases.create");
    Route::get("/transactions/purchases/{purchase}", [PurchaseController::class, "show"])->name("transactions.purchases.show");

    // Transfers (Level <= 10)
    Route::get("/transactions/transfers/create", [TransactionController::class, "createTransfer"])->name("transactions.transfers.create");
    Route::post("/transactions/transfers", [TransactionController::class, "storeTransfer"])->name("transactions.transfers.store");

    // Sells (Level <= 20)
    Route::get("/transactions/sells/create", [SellController::class, "create"])->name("transactions.sells.create");
    Route::post("/transactions/sells", [SellController::class, "store"])->name("transactions.sells.store");
    Route::get("/transactions/sells/{sell}", [SellController::class, "show"])->name("transactions.sells.show");

    // Stock Management (Level <= 10)
    Route::get("/stock", [StockController::class, "index"])->name("stock.index");
    Route::get("/stock/adjust", [StockController::class, "showAdjustForm"])->name("stock.adjust.form");
    Route::post("/stock/adjust", [StockController::class, "adjust"])->name("stock.adjust");
    Route::get("/stock/{inventory}", [StockController::class, "show"])->name("stock.show");
    Route::get("/stock-movements", [StockMovementController::class, "index"])->name("stock-movements.index");
});

require __DIR__ . "/auth.php";

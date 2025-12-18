<?php

use App\Http\Controllers\Auth\SetupController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LocationsController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\StockController;
use App\Http\Controllers\StockMovementController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\TypeController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\Transaction\PurchaseController;
use App\Http\Controllers\Transaction\SellController;
use App\Http\Controllers\Transaction\TransactionController;
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

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
    ]);
})->middleware('ensure.setup');

Route::middleware(['auth', 'verified', 'ensure.setup'])->group(function () {

    Route::get('/dashboard', DashboardController::class)->name('dashboard');

    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllRead'])->name('notifications.readAll');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::put('/password', [ProfileController::class, 'updatePassword'])->name('password.update');

    Route::get('/api/inventory/quantity', [StockController::class, 'getQuantity'])->name('api.inventory.quantity');

    Route::prefix('purchase-cart')->name('purchase.cart.')->controller(PurchaseCartController::class)->group(function () {
        Route::post('/', 'store')->name('store');
        Route::patch('/{cartItem}', 'update')->name('update');
        Route::delete('/', 'destroySupplier')->name('destroy.supplier');
        Route::delete('/{cartItem}', 'destroyItem')->name('destroy.item');
    });

    Route::prefix('sell-cart')->name('sell.cart.')->controller(SellCartController::class)->group(function () {
        Route::post('/', 'store')->name('store');
        Route::patch('/{cartItem}', 'update')->name('update');
        Route::delete('/', 'destroyLocation')->name('destroy.location');
        Route::delete('/{cartItem}', 'destroyItem')->name('destroy.item');
    });

    Route::middleware(['can:viewAny,' . User::class])->group(function () {
        Route::post('users/{user}/restore', [UserController::class, 'restore'])->name('users.restore')->withTrashed();

        Route::resource('users', UserController::class)->except(['destroy']);
        Route::delete('users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
        Route::resource('types', TypeController::class)->except(['store']);
    });

    Route::post('/types', [TypeController::class, 'store'])->name('types.store');

    Route::middleware(['can:viewAny,' . Location::class])->group(function () {
        Route::post('locations/{location}/restore', [LocationsController::class, 'restore'])->name('locations.restore')->withTrashed();

        Route::resource('locations', LocationsController::class)->withTrashed();
    });

    Route::middleware(['can:viewAny,' . Customer::class])->group(function () {
        Route::post('customers/{customer}/restore', [CustomerController::class, 'restore'])->name('customers.restore')->withTrashed();

        Route::resource('customers', CustomerController::class)->withTrashed();
    });

    Route::middleware(['can:viewAny,' . Supplier::class])->group(function () {
        Route::post('suppliers/{supplier}/restore', [SupplierController::class, 'restore'])->name('suppliers.restore')->withTrashed();

        Route::resource('suppliers', SupplierController::class);
    });

    Route::middleware(['can:viewAny,' . Product::class])->group(function () {
        Route::post('products/{product}/restore', [ProductController::class, 'restore'])->name('products.restore')->withTrashed();

        Route::resource('products', ProductController::class)->withTrashed();
    });

    Route::get('/transactions', [TransactionController::class, 'index'])->name('transactions.index');

    Route::get('/transactions/purchases/create', [PurchaseController::class, 'create'])->name('transactions.purchases.create');
    Route::post('/transactions/purchases', [PurchaseController::class, 'store'])->name('transactions.purchases.store');
    Route::get('/transactions/purchases/{purchase}', [PurchaseController::class, 'show'])->name('transactions.purchases.show');

    Route::get('/transactions/transfers/create', [TransactionController::class, 'createTransfer'])->name('transactions.transfers.create');
    Route::post('/transactions/transfers', [TransactionController::class, 'storeTransfer'])->name('transactions.transfers.store');

    Route::get('/transactions/sells/create', [SellController::class, 'create'])->name('transactions.sells.create');
    Route::post('/transactions/sells', [SellController::class, 'store'])->name('transactions.sells.store');
    Route::get('/transactions/sells/{sell}', [SellController::class, 'show'])->name('transactions.sells.show');

    Route::get('/stock', [StockController::class, 'index'])->name('stock.index');
    Route::get('/stock/adjust', [StockController::class, 'showAdjustForm'])->name('stock.adjust.form');
    Route::post('/stock/adjust', [StockController::class, 'adjust'])->name('stock.adjust');
    Route::get('/stock/{inventory}', [StockController::class, 'show'])->name('stock.show');

    Route::get('/stock-movements', [StockMovementController::class, 'index'])->name('stock-movements.index');
});

require __DIR__ . '/auth.php';

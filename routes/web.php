<?php

use App\Http\Controllers\Transaction\PurchaseController;
use App\Http\Controllers\Transaction\StockMovementController;
use App\Http\Controllers\Transaction\StockTransferController;
use App\Http\Controllers\Transaction\TransactionController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\LocationsController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\StockController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\TypeController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
    ]);
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', fn () => Inertia::render('Dashboard'))->name('dashboard');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::put('password', [ProfileController::class, 'updatePassword'])->name('password.update');
    Route::get('/api/inventory/quantity', [StockController::class, 'getQuantity'])->name('api.inventory.quantity');

    Route::middleware(['role:Super Admin'])->group(function () {
        Route::resource('users', UserController::class)->except(['destroy']);
        Route::delete('users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
        Route::resource('types', TypeController::class);

        Route::get('/locations/create', [LocationsController::class, 'create'])->name('locations.create');
        Route::post('/locations', [LocationsController::class, 'store'])->name('locations.store');
        Route::get('/locations/{location}/edit', [LocationsController::class, 'edit'])->name('locations.edit')->withTrashed();
        Route::patch('/locations/{location}', [LocationsController::class, 'update'])->name('locations.update')->withTrashed();
        Route::delete('/locations/{location}', [LocationsController::class, 'destroy'])->name('locations.destroy');
        Route::post('/locations/{location}/restore', [LocationsController::class, 'restore'])->name('locations.restore')->withTrashed();
    });

    Route::post('/types', [TypeController::class, 'store'])
        ->name('types.store')
        ->middleware(['role:Super Admin|Warehouse Manager|Branch Manager']);

    Route::middleware(['role:Super Admin|Branch Manager'])->group(function () {
        Route::resource('customers', CustomerController::class);
    });

    Route::middleware(['role:Super Admin|Warehouse Manager|Branch Manager'])->group(function () {
        Route::get('/locations', [LocationsController::class, 'index'])->name('locations.index');

        Route::get('/products', [ProductController::class, 'index'])->name('products.index');
        Route::get('/products/create', [ProductController::class, 'create'])->name('products.create');
        Route::post('/products', [ProductController::class, 'store'])->name('products.store');
        Route::get('/products/{product}/edit', [ProductController::class, 'edit'])->name('products.edit')->withTrashed();

        Route::patch('/products/{product}', [ProductController::class, 'update'])->name('products.update')->withTrashed();
        Route::delete('/products/{product}', [ProductController::class, 'destroy'])->name('products.destroy')->withTrashed();
        Route::post('/products/{product}/restore', [ProductController::class, 'restore'])->name('products.restore')->withTrashed();

        Route::get('/suppliers', [SupplierController::class, 'index'])->name('suppliers.index');
        Route::get('/suppliers/create', [SupplierController::class, 'create'])->name('suppliers.create');
        Route::post('/suppliers', [SupplierController::class, 'store'])->name('suppliers.store');
        Route::get('/suppliers/{supplier}/edit', [SupplierController::class, 'edit'])->name('suppliers.edit')->withTrashed();
        Route::patch('/suppliers/{supplier}', [SupplierController::class, 'update'])->name('suppliers.update')->withTrashed();
        Route::delete('/suppliers/{supplier}', [SupplierController::class, 'destroy'])->name('suppliers.destroy')->withTrashed();
        Route::post('/suppliers/{supplier}/restore', [SupplierController::class, 'restore'])->name('suppliers.restore')->withTrashed();

        Route::get('/transactions', [TransactionController::class, 'index'])->name('transactions.index');
        Route::post('/transactions/purchases', [PurchaseController::class, 'store'])->name('transactions.purchases.store');
        Route::get('/transactions/purchases/create', [PurchaseController::class, 'create'])->name('transactions.purchases.create');
        Route::get('/transactions/purchases/{purchase}', [PurchaseController::class, 'show'])->name('transactions.purchases.show');
    });

    Route::middleware(['role:Super Admin|Warehouse Manager'])->group(function () {
        Route::get('/stock', [StockController::class, 'index'])->name('stock.index');
        Route::get('/stock/adjust', [StockController::class, 'showAdjustForm'])->name('stock.adjust.form');
        Route::post('/stock/adjust', [StockController::class, 'adjust'])->name('stock.adjust');
        Route::get('/stock/{inventory}', [StockController::class, 'show'])->name('stock.show');

        Route::get('/stock-movements', [StockMovementController::class, 'index'])->name('stock-movements.index');

        Route::get('/transactions/transfers/create', [StockTransferController::class, 'create'])->name('transactions.transfers.create');
        Route::post('/transactions/transfers', [StockTransferController::class, 'store'])->name('transactions.transfers.store');
    });
});

require __DIR__ . '/auth.php';

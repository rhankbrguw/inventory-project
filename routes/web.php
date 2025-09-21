<?php

use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\StockController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\Transaction\PurchaseController;
use App\Http\Controllers\Transaction\TransactionController;
use App\Http\Controllers\TypeController;
use App\Http\Controllers\UserController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
   return Inertia::render('Welcome', [
      'canLogin' => Route::has('login'),
      'canRegister' => Route::has('register'),
      'laravelVersion' => Application::VERSION,
      'phpVersion' => PHP_VERSION,
   ]);
});

Route::middleware(['auth', 'verified'])->group(function () {
   Route::get('/dashboard', fn() => Inertia::render('Dashboard'))->name('dashboard');

   Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
   Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
   Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

   // Super Admin Only
   Route::middleware(['role:Super Admin'])->group(function () {
      Route::resource('users', UserController::class);
      Route::resource('types', TypeController::class)->except(['store']);
   });

   // Contextual Type Creation
   Route::post('/types', [TypeController::class, 'store'])
      ->name('types.store')
      ->middleware(['role:Super Admin|Branch Manager']);

   // All Managers
   Route::middleware(['role:Super Admin|Warehouse Manager|Branch Manager'])->group(function () {
      Route::resource('products', ProductController::class);
      Route::resource('suppliers', SupplierController::class);

      // TRANSACTIONS MODULE
      Route::get('/transactions', [TransactionController::class, 'index'])->name('transactions.index');
      Route::post('/transactions/purchases', [PurchaseController::class, 'store'])->name('transactions.purchases.store');
      Route::get('/transactions/purchases/create', [PurchaseController::class, 'create'])->name('transactions.purchases.create');
      Route::get('/transactions/purchases/{purchase}', [PurchaseController::class, 'show'])->name('transactions.purchases.show');
   });

   // Stock Management
   Route::middleware(['role:Super Admin|Warehouse Manager'])->group(function () {
      Route::get('/stock', [StockController::class, 'index'])->name('stock.index');
      Route::get('/stock/adjust', [StockController::class, 'showAdjustForm'])->name('stock.adjust.form');
      Route::post('/stock/adjust', [StockController::class, 'adjust'])->name('stock.adjust');
   });
});

require __DIR__ . '/auth.php';

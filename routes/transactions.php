<?php

use App\Http\Controllers\Transaction\PurchaseController;
use App\Http\Controllers\Transaction\SellController;
use App\Http\Controllers\Transaction\StockTransferController;
use App\Http\Controllers\Transaction\TransactionController;
use Illuminate\Support\Facades\Route;

Route::get('/transactions', [TransactionController::class, 'index'])->name('transactions.index');

Route::prefix('transactions/purchases')->name('transactions.purchases.')->controller(PurchaseController::class)->group(function () {
    Route::get('/', fn () => redirect()->route('transactions.index', ['tab' => 'purchases']));
    Route::get('/create', 'create')->name('create');
    Route::post('/', 'store')->name('store');
    Route::get('/{purchase}', 'show')->name('show');
    Route::post('/{purchase}/approve', 'approve')->name('approve');
    Route::post('/{purchase}/reject', 'reject')->name('reject');
    Route::post('/{purchase}/ship', 'ship')->name('ship');
    Route::post('/{purchase}/receive', 'receive')->name('receive');
});

Route::prefix('transactions/transfers')->name('transactions.transfers.')->controller(StockTransferController::class)->group(function () {
    Route::get('/', fn () => redirect()->route('transactions.index', ['tab' => 'transfers']));
    Route::get('/create', 'create')->name('create');
    Route::post('/', 'store')->name('store');
    Route::get('/{stockTransfer}', 'show')->name('show');
    Route::post('/{stockTransfer}/approve', 'approve')->name('approve');
    Route::post('/{stockTransfer}/reject', 'reject')->name('reject');
    Route::post('/{stockTransfer}/ship', 'ship')->name('ship');
    Route::post('/{stockTransfer}/receive', 'receive')->name('receive');
});

Route::prefix('transactions/sells')->name('transactions.sells.')->controller(SellController::class)->group(function () {
    Route::get('/', fn () => redirect()->route('transactions.index', ['tab' => 'sells']));
    Route::get('/create', 'create')->name('create');
    Route::post('/', 'store')->name('store');
    Route::get('/{sell}', 'show')->name('show');
    Route::post('/{sell}/approve', 'approve')->name('approve');
    Route::post('/{sell}/reject', 'reject')->name('reject');
    Route::post('/{sell}/ship', 'ship')->name('ship');
    Route::post('/{sell}/receive', 'receive')->name('receive');
});

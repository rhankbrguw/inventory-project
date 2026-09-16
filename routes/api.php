<?php

use App\Http\Controllers\PaymentWebhookController;
use App\Http\Controllers\ProductController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/payment/webhook/midtrans', [PaymentWebhookController::class, 'handleMidtrans'])->name('api.payment.webhook.midtrans');
Route::post('/midtrans/webhook', [PaymentWebhookController::class, 'handleMidtrans'])->name('api.midtrans.webhook');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', fn (Request $request) => $request->user());
    Route::get('/products/search', [ProductController::class, 'search'])->name('api.products.search');
});

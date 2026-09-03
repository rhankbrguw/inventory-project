<?php

use App\Http\Controllers\Auth\SetupController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\InstallmentController;
use App\Http\Controllers\LocaleController;
use App\Http\Controllers\LocationsController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\StockController;
use App\Http\Controllers\StockMovementController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\Transaction\PurchaseCartController;
use App\Http\Controllers\Transaction\SellCartController;
use App\Http\Controllers\TypeController;
use App\Http\Controllers\UserController;
use App\Models\Customer;
use App\Models\Location;
use App\Models\Product;
use App\Models\StockMovement;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Broadcast::routes(['middleware' => ['web', 'auth']]);

Route::middleware('guest')->group(function () {
    Route::get('/setup', [SetupController::class, 'index'])->name('setup.index');
    Route::post('/setup', [SetupController::class, 'store'])->name('setup.store');
});

Route::get('/', fn () => Inertia::render('Welcome', [
    'canLogin' => Route::has('login'), 'canRegister' => Route::has('register'),
    'locale' => session('locale', config('app.locale')),
]))->middleware('ensure.setup');

Route::post('/locale', [LocaleController::class, 'update'])->name('locale.update');

Route::middleware(['auth', 'verified', 'ensure.setup'])->group(function () {
    Route::get('/dashboard', DashboardController::class)->name('dashboard');
    Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');

    Route::prefix('notifications')->name('notifications.')->controller(NotificationController::class)->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/api', 'api')->name('api');
        Route::post('/{id}/read', 'markAsRead')->name('read');
        Route::post('/read-all', 'markAllRead')->name('readAll');
    });

    Route::prefix('profile')->name('profile.')->controller(ProfileController::class)->group(function () {
        Route::get('/', 'edit')->name('edit');
        Route::patch('/', 'update')->name('update');
        Route::delete('/', 'destroy')->name('destroy');
    });
    Route::put('/password', [ProfileController::class, 'updatePassword'])->name('password.update');
    Route::get('/api/inventory/quantity', [StockController::class, 'getQuantity'])->name('api.inventory.quantity');

    Route::prefix('purchase-cart')->name('purchase.cart.')->controller(PurchaseCartController::class)->group(function () {
        Route::post('/', 'store')->name('store');
        Route::patch('/{cartItem}', 'update')->name('update');
        Route::delete('/destroy-all', 'destroyAll')->name('destroy.all');
        Route::delete('/', 'destroySupplier')->name('destroy.supplier');
        Route::delete('/{cartItem}', 'destroyItem')->name('destroy.item');
    });

    Route::prefix('sell-cart')->name('sell.cart.')->controller(SellCartController::class)->group(function () {
        Route::post('/', 'store')->name('store');
        Route::patch('/prices/update', 'updatePricesByChannel')->name('update-prices');
        Route::patch('/{cartItem}', 'update')->name('update');
        Route::delete('/', 'destroyLocation')->name('destroy.location');
        Route::delete('/{cartItem}', 'destroyItem')->name('destroy.item');
    });

    Route::middleware(['can:viewAny,'.User::class])->group(function () {
        Route::post('users/{user}/restore', [UserController::class, 'restore'])->name('users.restore')->withTrashed();
        Route::resource('users', UserController::class)->withTrashed();
        Route::post('types/{type}/restore', [TypeController::class, 'restore'])->name('types.restore')->withTrashed();
        Route::post('/types', [TypeController::class, 'store'])->name('types.store');
        Route::resource('types', TypeController::class)->except(['store'])->withTrashed();
    });

    Route::middleware(['can:viewAny,'.Location::class])->group(function () {
        Route::post('locations/{location}/restore', [LocationsController::class, 'restore'])->name('locations.restore')->withTrashed();
        Route::resource('locations', LocationsController::class)->withTrashed();
    });

    Route::middleware(['can:viewAny,'.Customer::class])->group(function () {
        Route::post('customers/{customer}/restore', [CustomerController::class, 'restore'])->name('customers.restore')->withTrashed();
        Route::resource('customers', CustomerController::class)->withTrashed();
    });

    Route::middleware(['can:viewAny,'.Supplier::class])->group(function () {
        Route::post('suppliers/{supplier}/restore', [SupplierController::class, 'restore'])->name('suppliers.restore')->withTrashed();
        Route::resource('suppliers', SupplierController::class);
    });

    Route::middleware(['can:viewAny,'.Product::class])->group(function () {
        Route::post('products/{product}/restore', [ProductController::class, 'restore'])->name('products.restore')->withTrashed();
        Route::resource('products', ProductController::class)->withTrashed();
    });

    require __DIR__.'/transactions.php';

    Route::post('/installments/{installment}/pay', [InstallmentController::class, 'pay'])->name('installments.pay');

    Route::prefix('payment')->name('payment.')->middleware('throttle:payment')->controller(PaymentController::class)->group(function () {
        Route::post('/sell/{sell}/snap-token', 'createSellSnapToken')->name('sell.snap');
        Route::post('/purchase/{purchase}/snap-token', 'createPurchaseSnapToken')->name('purchase.snap');
        Route::post('/installment/{installment}/snap-token', 'createInstallmentSnapToken')->name('installment.snap');
        Route::post('/{orderId}/verify', 'verifyPayment')->name('verify');
        Route::get('/status/{orderId}', 'checkStatus')->name('status');
    });

    Route::prefix('stock')->name('stock.')->controller(StockController::class)->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/adjust', 'showAdjustForm')->name('adjust.form');
        Route::post('/adjust', 'adjust')->name('adjust');
        Route::get('/{inventory}', 'show')->name('show');
    });

    Route::middleware(['can:viewAny,'.StockMovement::class])
        ->get('/stock-movements', [StockMovementController::class, 'index'])->name('stock-movements.index');
});

require __DIR__.'/auth.php';

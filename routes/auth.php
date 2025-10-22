<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\ConfirmablePasswordController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\RegisteredUserController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\OtpController;

Route::middleware("guest")->group(function () {
    Route::get("register", [RegisteredUserController::class, "create"])->name(
        "register",
    );

    Route::post("register", [RegisteredUserController::class, "store"]);

    Route::get("login", [
        AuthenticatedSessionController::class,
        "create",
    ])->name("login");

    Route::post("login", [AuthenticatedSessionController::class, "store"]);

    Route::get("forgot-password", [
        PasswordResetLinkController::class,
        "create",
    ])->name("password.request");

    Route::post("forgot-password", [
        PasswordResetLinkController::class,
        "store",
    ])->name("password.email");

    Route::get("reset-password/{token}", [
        NewPasswordController::class,
        "create",
    ])->name("password.reset");

    Route::post("reset-password", [
        NewPasswordController::class,
        "store",
    ])->name("password.store");
});

Route::get("verify-otp", [OtpController::class, "show"])->name(
    "verification.notice",
);
Route::post("verify-otp", [OtpController::class, "verify"])
    ->middleware("throttle:6,1")
    ->name("otp.verify");
Route::post("resend-otp", [OtpController::class, "resend"])
    ->middleware("throttle:6,1")
    ->name("verification.send");

Route::middleware("auth")->group(function () {
    Route::get("confirm-password", [
        ConfirmablePasswordController::class,
        "show",
    ])->name("password.confirm");

    Route::post("confirm-password", [
        ConfirmablePasswordController::class,
        "store",
    ]);

    Route::post("logout", [
        AuthenticatedSessionController::class,
        "destroy",
    ])->name("logout");
});

<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Providers\RouteServiceProvider;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
   public function create(): Response
   {
      return Inertia::render('Auth/Login', [
         'canResetPassword' => Route::has('password.request'),
         'status' => session('status'),
      ]);
   }

   public function store(LoginRequest $request): RedirectResponse
   {
      $request->authenticate();

      $user = $request->user();

      if (is_null($user->email_verified_at)) {
         Auth::guard('web')->logout();
         $request->session()->invalidate();
         $request->session()->regenerateToken();

         $user->sendOtpNotification();

         return redirect()->route('verification.notice')->with('email', $user->email);
      }

      $request->session()->regenerate();

      return redirect()->intended(RouteServiceProvider::HOME);
   }

   public function destroy(Request $request): RedirectResponse
   {
      Auth::guard('web')->logout();

      $request->session()->invalidate();

      $request->session()->regenerateToken();

      return redirect('/');
   }
}

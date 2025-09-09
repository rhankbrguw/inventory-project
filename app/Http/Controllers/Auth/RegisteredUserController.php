<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Mail\OtpMail;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
   public function create(): Response
   {
      return Inertia::render('Auth/Register');
   }

   public function store(Request $request): RedirectResponse
   {
      $request->validate([
         'name' => 'required|string|min:3|max:255',
         'email' => 'required|string|email:rfc,dns|max:255|unique:' . User::class,
         'password' => ['required', 'confirmed', Rules\Password::defaults()],
      ]);

      $otp = \random_int(100000, 999999);

      $user = User::create([
         'name' => $request->name,
         'email' => $request->email,
         'password' => Hash::make($request->password),
         'otp_code' => $otp,
         'otp_expires_at' => now()->addMinutes(5),
      ]);

      Mail::to($user->email)->send(new OtpMail($user, (string) $otp, 5));

      return redirect()->route('verification.notice')->with('email', $user->email);
   }
}

<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Mail\OtpMail;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;

class OtpController extends Controller
{
   public function show(Request $request)
   {
      return inertia('Auth/VerifyOtp', [
         'email' => $request->session()->get('email', Auth::user()?->email),
         'status' => session('status'),
      ]);
   }

   public function verify(Request $request)
   {
      $request->validate([
         'email' => 'required|email',
         'otp_code' => 'required|numeric|digits:6',
      ]);

      $user = User::where('email', $request->email)->whereNull('email_verified_at')->first();

      if (!$user) {
         return back()->withErrors(['email' => 'User tidak ditemukan atau sudah terverifikasi.']);
      }

      if (now()->gt($user->otp_expires_at)) {
         return back()->withErrors(['otp_code' => 'Kode OTP telah kedaluwarsa.']);
      }

      if ($user->otp_code !== $request->otp_code) {
         return back()->withErrors(['otp_code' => 'Kode OTP tidak valid.']);
      }

      $user->forceFill([
         'email_verified_at' => now(),
         'otp_code' => null,
         'otp_expires_at' => null,
      ])->save();

      Auth::login($user);

      $request->session()->regenerate();

      return redirect()->intended('/dashboard');
   }

   public function resend(Request $request)
   {
      $request->validate(['email' => 'required|email']);

      /** @var \App\Models\User $user */
      $user = User::where('email', $request->email)->whereNull('email_verified_at')->first();

      if (!$user) {
         return back()->withErrors(['email' => 'User tidak ditemukan atau sudah terverifikasi.']);
      }

      $otp = \random_int(100000, 999999);

      $user->forceFill([
         'otp_code' => $otp,
         'otp_expires_at' => now()->addMinutes(5),
      ])->save();

      Mail::to($user->email)->send(new OtpMail($user, (string) $otp, 5));

      return back()->with('status', 'Kode OTP baru telah berhasil dikirim ulang.');
   }
}

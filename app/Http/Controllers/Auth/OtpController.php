<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Mail\OtpMail;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class OtpController extends Controller
{
    public function show(Request $request): Response
    {
        return Inertia::render('Auth/VerifyOtp', [
            'email' => $request->session()->get('email', Auth::user()?->email),
            'status' => session('status'),
        ]);
    }

    public function verify(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => ['required', 'string', 'lowercase', 'email:rfc,dns', 'max:50'],
            'otp_code' => ['required', 'numeric', 'digits:6'],
        ]);

        $user = User::where('email', $request->email)
            ->whereNull('email_verified_at')
            ->first();

        if (!$user) {
            return Redirect::back()->withErrors(['email' => 'User tidak ditemukan atau sudah terverifikasi.']);
        }

        if (now()->gt($user->otp_expires_at)) {
            return Redirect::back()->withErrors(['otp_code' => 'Kode OTP telah kedaluwarsa.']);
        }

        if ((string) $user->otp_code !== (string) $request->otp_code) {
            return Redirect::back()->withErrors(['otp_code' => 'Kode OTP tidak valid.']);
        }

        $user->forceFill([
            'email_verified_at' => now(),
            'otp_code' => null,
            'otp_expires_at' => null,
        ])->save();

        Auth::login($user);

        $request->session()->regenerate();

        return Redirect::intended('/dashboard');
    }

    public function resend(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => ['required', 'string', 'lowercase', 'email:rfc,dns', 'max:50'],
        ]);

        $user = User::where('email', $request->email)
            ->whereNull('email_verified_at')
            ->first();

        if (!$user) {
            return Redirect::back()->withErrors(['email' => 'User tidak ditemukan atau sudah terverifikasi.']);
        }

        $otp = random_int(100000, 999999);

        $user->forceFill([
            'otp_code' => $otp,
            'otp_expires_at' => now()->addMinutes(5),
        ])->save();

        Mail::to($user->email)->send(new OtpMail($user, (string) $otp, 5));

        return Redirect::back()->with('status', 'Kode OTP baru telah berhasil dikirim ulang.');
    }
}

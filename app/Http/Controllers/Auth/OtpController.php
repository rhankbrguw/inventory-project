<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Mail\WelcomeMail;
use App\Models\User;
use App\Rules\ValidEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class OtpController extends Controller
{
    public function show(Request $request): Response|RedirectResponse
    {
        $email = $request->query('email') ?: $request->session()->get('email', Auth::user()?->email);

        if (! $email) {
            return redirect()->route('login');
        }

        return Inertia::render('Auth/VerifyOtp', [
            'email' => $email,
            'status' => session('status'),
        ]);
    }

    public function verify(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => ['required', 'string', 'lowercase', 'max:50', new ValidEmail],
            'otp_code' => ['required', 'numeric', 'digits:6'],
        ]);

        $user = User::where('email', $request->email)->whereNull('email_verified_at')->first();
        $error = $this->validateOtpState($user, (string) $request->otp_code);
        if ($error) {
            return Redirect::back()->withErrors($error);
        }

        $user->forceFill(['email_verified_at' => now(), 'otp_code' => null, 'otp_expires_at' => null])->save();
        rescue(fn () => Mail::to($user)->send(new WelcomeMail($user)));

        Auth::login($user);
        $request->session()->regenerate();

        return Redirect::intended('/dashboard');
    }

    private function validateOtpState(?User $user, string $code): ?array
    {
        if (! $user) {
            return ['email' => __('messages.otp.user_not_found')];
        }
        if (now()->gt($user->otp_expires_at)) {
            return ['otp_code' => __('messages.otp.expired')];
        }
        if ((string) $user->otp_code !== $code) {
            return ['otp_code' => __('messages.otp.invalid')];
        }

        return null;
    }

    public function resend(Request $request): RedirectResponse
    {
        $request->validate(['email' => ['required', 'string', 'lowercase', 'max:50', new ValidEmail]]);
        $user = User::where('email', $request->email)->whereNull('email_verified_at')->first();
        if (! $user) {
            return Redirect::back()->withErrors(['email' => __('messages.otp.user_not_found')]);
        }

        $user->sendOtpNotification();

        return Redirect::back()->with('status', __('messages.otp.resent'));
    }
}

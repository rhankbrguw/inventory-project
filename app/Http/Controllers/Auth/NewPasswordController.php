<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Rules\ValidEmail;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;

class NewPasswordController extends Controller
{
    public function create(Request $request): \Inertia\Response
    {
        return inertia('Auth/ResetPassword', [
            'email' => $request->email,
            'token' => $request->route('token'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'token' => 'required',
            'email' => ['required', 'string', 'lowercase', new ValidEmail],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $this->ensureNotPreviousPassword($request->email, $request->password);
        $status = $this->performPasswordReset($request);

        if ($status == Password::PASSWORD_RESET) {
            return redirect()->route('login')->with('status', __($status));
        }

        throw ValidationException::withMessages(['email' => [trans($status)]]);
    }

    private function ensureNotPreviousPassword(string $email, string $password): void
    {
        $user = User::where('email', $email)->first();
        if ($user && Hash::check($password, $user->password)) {
            throw ValidationException::withMessages(['password' => __('validation.password.different')]);
        }
    }

    private function performPasswordReset(Request $request): string
    {
        return Password::reset($request->only('email', 'password', 'password_confirmation', 'token'), function ($user) use ($request) {
            $user->forceFill(['password' => Hash::make($request->password), 'remember_token' => Str::random(60)])->save();
            event(new PasswordReset($user));
        });
    }
}

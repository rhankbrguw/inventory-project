<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use App\Models\User;

class NewPasswordController extends Controller
{
   public function create(Request $request)
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
         'email' => 'required|email',
         'password' => ['required', 'confirmed', Rules\Password::defaults()],
      ]);

      $user = User::where('email', $request->email)->first();

      if ($user && Hash::check($request->password, $user->password)) {
         throw ValidationException::withMessages([
            'password' => 'Password baru tidak boleh sama dengan password lama Anda.',
         ]);
      }

      $status = Password::reset(
         $request->only('email', 'password', 'password_confirmation', 'token'),
         function ($user) use ($request) {
            $user->forceFill([
               'password' => Hash::make($request->password),
               'remember_token' => Str::random(60),
            ])->save();

            event(new PasswordReset($user));
         }
      );

      if ($status == Password::PASSWORD_RESET) {
         return redirect()->route('login')->with('status', __($status));
      }

      throw ValidationException::withMessages([
         'email' => [trans($status)],
      ]);
   }
}

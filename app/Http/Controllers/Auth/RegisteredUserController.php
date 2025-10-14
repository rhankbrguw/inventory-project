<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
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
         'name' => ['required', 'string', 'min:3', 'max:255'],
         'email' => ['required', 'string', 'email:rfc,dns', 'max:255', 'unique:' . User::class],
         'password' => ['required', 'confirmed', Rules\Password::defaults()],
      ]);

      $user = User::create([
         'name' => $request->name,
         'email' => $request->email,
         'password' => Hash::make($request->password),
      ]);

      $user->sendOtpNotification();

      return redirect()->route('verification.notice')->with('email', $user->email);
   }
}

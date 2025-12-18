<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;
use App\Rules\UniqueRule;
use App\Rules\ValidPhoneNumber;

class RegisteredUserController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'min:3', 'max:50'],
            'email' => ['required', 'string', 'email:rfc,dns', 'max:50', 'unique:' . User::class],
            'phone' => ['nullable', 'string', new ValidPhoneNumber(), new UniqueRule('users', null, 'phone')],
            'password' => [
                'required',
                'confirmed',
                Rules\Password::min(8)->letters()->numbers()
            ],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => ValidPhoneNumber::format($validated['phone'] ?? null),
            'password' => Hash::make($validated['password']),
        ]);

        $user->assignRole('Staff');
        $user->sendOtpNotification();

        Auth::login($user);

        return redirect()->route('verification.notice');
    }
}

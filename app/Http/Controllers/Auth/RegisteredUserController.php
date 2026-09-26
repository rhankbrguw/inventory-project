<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use App\Rules\UniqueRule;
use App\Rules\ValidEmail;
use App\Rules\ValidName;
use App\Rules\ValidPhoneNumber;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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
        $request->merge(['phone' => ValidPhoneNumber::format($request->phone)]);
        $registrationInput = $request->validate([
            'name' => ['required', 'string', 'min:3', 'max:50', new ValidName],
            'email' => ['required', 'string', 'lowercase', 'max:50', new ValidEmail, 'unique:'.User::class],
            'phone' => ['nullable', 'string', new UniqueRule('users', null, 'phone')],
            'password' => ['required', 'confirmed', Rules\Password::min(8)->letters()->numbers()],
        ]);

        $user = $this->createNewUser($registrationInput);
        Auth::guard('web')->login($user);

        return redirect()->route('verification.notice', ['email' => $user->email]);
    }

    private function createNewUser(array $registrationInput): User
    {
        $user = User::create([
            'name' => $registrationInput['name'], 'email' => $registrationInput['email'],
            'phone' => ValidPhoneNumber::format($registrationInput['phone'] ?? null),
            'password' => Hash::make($registrationInput['password']),
        ]);
        $user->assignRole(Role::NAME_STAFF);
        $user->sendOtpNotification();

        return $user;
    }
}

<?php

namespace App\Http\Controllers;

use App\Http\Requests\Auth\UpdatePasswordRequest;
use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
        ]);
    }

    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        $user->fill($request->validated());

        $changes = $this->collectDirtyFields($user);
        $user->save();

        $msg = empty($changes) ? __('messages.profile.no_changes') : __('messages.profile.updated', ['changes' => ucfirst(implode(', ', $changes))]);

        return Redirect::route('profile.edit')->with('success', $msg);
    }

    private function collectDirtyFields(\App\Models\User $user): array
    {
        $changes = [];
        if ($user->isDirty('name')) {
            $changes[] = __('validation.attributes.name');
        }
        if ($user->isDirty('email')) {
            $changes[] = __('validation.attributes.email');
            $user->email_verified_at = null;
        }
        if ($user->isDirty('phone')) {
            $changes[] = __('validation.attributes.phone');
        }

        return $changes;
    }

    public function updatePassword(UpdatePasswordRequest $request): RedirectResponse
    {
        $key = 'update-password:'.$request->user()->id;
        if (RateLimiter::tooManyAttempts($key, 5)) {
            $mins = ceil(RateLimiter::availableIn($key) / 60);

            return Redirect::back()->withErrors(['current_password' => __('messages.profile.too_many_attempts_password', ['minutes' => $mins])]);
        }

        $request->user()->update(['password' => Hash::make($request->validated('password'))]);
        RateLimiter::clear($key);

        return Redirect::back()->with('success', __('messages.profile.password_updated'));
    }

    public function destroy(Request $request): RedirectResponse
    {
        $key = 'delete-account:'.$request->user()->id;
        if (RateLimiter::tooManyAttempts($key, 3)) {
            $mins = ceil(RateLimiter::availableIn($key) / 60);

            return Redirect::back()->withErrors(['password' => __('messages.profile.too_many_attempts_delete', ['minutes' => $mins])]);
        }

        $request->validate(['password' => ['required', 'current_password']], ['password.current_password' => __('messages.profile.password_mismatch')]);
        $user = $request->user();
        Auth::logout();
        $user->delete();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        RateLimiter::clear($key);

        return Redirect::to('/')->with('success', __('messages.profile.account_deleted'));
    }
}

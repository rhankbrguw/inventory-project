<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\Http\Requests\Auth\UpdatePasswordRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
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

      if ($user->isDirty('email')) {
         $user->email_verified_at = null;
      }

      $user->save();

      return Redirect::route('profile.edit')->with('success', 'Profile updated successfully.');
   }

   public function updatePassword(UpdatePasswordRequest $request): RedirectResponse
   {
      $validated = $request->validated();

      $request->user()->update([
         'password' => Hash::make($validated['password']),
      ]);

      return back()->with('success', 'Password berhasil diperbarui');
   }

   public function destroy(Request $request): RedirectResponse
   {
      $request->validate([
         'password' => ['required', 'current_password'],
      ]);

      $user = $request->user();

      Auth::logout();

      $user->delete();

      $request->session()->invalidate();
      $request->session()->regenerateToken();

      return Redirect::to('/');
   }
}

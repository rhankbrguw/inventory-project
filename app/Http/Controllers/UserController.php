<?php

namespace App\Http\Controllers;

use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Hash;
use App\Http\Requests\StoreUserRequest;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
   public function index(): Response
   {
      return Inertia::render('Users/Index', [
         'users' => UserResource::collection(
            User::with('roles')->paginate(10)
         ),
      ]);
   }

   public function create()
   {
      return inertia('Users/Create', [
         'roles' => Role::pluck('name')->toArray(),
      ]);
   }

   public function store(StoreUserRequest $request)
   {
      $user = User::create([
         'name' => $request->name,
         'email' => $request->email,
         'password' => Hash::make($request->password),
      ]);

      $user->assignRole($request->role);

      return to_route('users.index')->with('success', 'Pengguna berhasil ditambahkan.');
   }

   public function edit(User $user)
   {
      return inertia('Users/Edit', [
         'user' => UserResource::make($user),
         'roles' => Role::pluck('name')->toArray(),
      ]);
   }

   public function update(Request $request, User $user)
   {
      $validated = $request->validate([
         'name' => 'required|string|max:255',
         'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
         'role' => 'required|string|exists:roles,name',
      ]);

      $user->update([
         'name' => $validated['name'],
         'email' => $validated['email'],
      ]);

      $user->syncRoles($validated['role']);

      return redirect()->route('users.index')->with('success', 'User updated successfully.');
   }

   public function destroy(User $user)
   {
      if ($user->id === auth()->id()) {
         return redirect()->route('users.index')->with('error', 'You cannot delete your own account.');
      }

      $user->delete();

      return redirect()->route('users.index')->with('success', 'User deleted successfully.');
   }
}

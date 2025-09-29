<?php

namespace App\Http\Controllers;

use App\Http\Resources\UserResource;
use App\Models\User;
use App\Models\Type;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Hash;
use App\Http\Requests\StoreUserRequest;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
   public function index(Request $request): Response
   {
      $users = User::query()
         ->with('roles')
         ->when($request->input('search'), function ($query, $search) {
            $query->where(function ($q) use ($search) {
               $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
         })
         ->when($request->input('role'), function ($query, $role) {
            $query->whereHas('roles', fn($q) => $q->where('name', 'like', "%{$role}%"));
         })
         ->when($request->input('sort'), function ($query, $sort) {
            if ($sort === 'name_asc') $query->orderBy('name', 'asc');
            if ($sort === 'name_desc') $query->orderBy('name', 'desc');
         }, function ($query) {
            $query->orderBy('name', 'asc');
         })
         ->paginate(10)
         ->withQueryString();

      return Inertia::render('Users/Index', [
         'users' => UserResource::collection($users),
         'roles' => Role::orderBy('name')->get(['name']),
         'filters' => (object) $request->only(['search', 'sort', 'role']),
      ]);
   }

   public function create()
   {
      return inertia('Users/Create', [
         'roles' => Type::where('group', Type::GROUP_USER_ROLE)->orderBy('name')->pluck('name')->toArray(),
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
         'user' => UserResource::make($user->load('roles')),
         'roles' => Type::where('group', Type::GROUP_USER_ROLE)->orderBy('name')->pluck('name')->toArray(),
      ]);
   }

   public function update(Request $request, User $user)
   {
      $validated = $request->validate([
         'name' => ['required', 'string', 'max:50', 'regex:/^[\pL\s\-]+$/u'],
         'email' => ['required', 'string', 'email', 'max:50', Rule::unique('users')->ignore($user->id)],
         'role' => 'required|string|exists:roles,name',
      ]);

      $user->update([
         'name' => $validated['name'],
         'email' => $validated['email'],
      ]);

      $user->syncRoles($validated['role']);

      return redirect()->route('users.index')->with('success', 'Pengguna berhasil diperbarui.');
   }

   public function destroy(User $user)
   {
      if ($user->id === auth()->id()) {
         return redirect()->route('users.index')->with('error', 'Anda tidak bisa menghapus akun sendiri.');
      }

      $user->delete();

      return redirect()->route('users.index')->with('success', 'Pengguna berhasil dihapus.');
   }
}

<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\Type;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $currentUserLevel = $request->user()->level;

        $users = User::query()
            ->with('roles')
            ->whereHas('roles', function ($q) use ($currentUserLevel) {
                $q->where('level', '>=', $currentUserLevel);
            })
            ->when($request->input('search'), function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%");
                });
            })
            ->when($request->input('role'), function ($query, $role) {
                $query->whereHas('roles', fn($q) => $q->where('name', 'like', "%{$role}%"));
            })
            ->when($request->input('status'), function ($query, $status) {
                if ($status === 'active') {
                    $query->whereNull('deleted_at');
                } elseif ($status === 'inactive') {
                    $query->whereNotNull('deleted_at');
                }
            })
            ->when(
                $request->input('sort'),
                function ($query, $sort) {
                    match ($sort) {
                        'name_asc' => $query->orderBy('name', 'asc'),
                        'name_desc' => $query->orderBy('name', 'desc'),
                        default => $query->orderBy('name', 'asc'),
                    };
                },
                function ($query) {
                    $query->orderBy('name', 'asc');
                }
            )
            ->withTrashed()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Users/Index', [
            'users' => UserResource::collection($users),
            'roles' => Role::where('level', '>=', $currentUserLevel)->orderBy('name')->get(['name']),
            'filters' => (object) $request->only(['search', 'sort', 'role']),
        ]);
    }

    public function create(Request $request): Response
    {
        $currentUserLevel = $request->user()->level;

        return Inertia::render('Users/Create', [
            'roles' => Type::where('group', Type::GROUP_USER_ROLE)
                ->where('level', '>', $currentUserLevel)
                ->orderBy('name')
                ->pluck('name')
                ->toArray(),
        ]);
    }

    public function store(StoreUserRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $roleType = Type::where('group', Type::GROUP_USER_ROLE)
            ->where('name', $validated['role'])
            ->first();

        if (!$roleType || $roleType->level <= $request->user()->level) {
            abort(403, 'You cannot assign a role equal to or higher than your own.');
        }

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'password' => Hash::make($validated['password']),
        ]);

        $user->assignRole($validated['role']);

        return Redirect::route('users.index')->with(
            'success',
            __('messages.user.created')
        );
    }

    public function edit(Request $request, User $user): Response
    {
        $currentUserLevel = $request->user()->level;

        return Inertia::render('Users/Edit', [
            'user' => UserResource::make($user->load('roles')),
            'roles' => Type::where('group', Type::GROUP_USER_ROLE)
                ->where('level', '>=', $currentUserLevel)
                ->orderBy('name')
                ->pluck('name')
                ->toArray(),
        ]);
    }

    public function update(
        UpdateUserRequest $request,
        User $user,
    ): RedirectResponse {
        $validated = $request->validated();

        if (isset($validated['role'])) {
            $roleType = Type::where('group', Type::GROUP_USER_ROLE)
                ->where('name', $validated['role'])
                ->first();

            if (!$roleType || $roleType->level < $request->user()->level) {
                abort(403, 'You cannot promote a user above your own level.');
            }
        }

        $oldRole = $user->roles->first();

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
        ]);

        $user->syncRoles($validated['role']);

        $newRole = $user->roles->first();
        $locationCount = $user->locations()->count();

        if ($oldRole && $newRole && $oldRole->id !== $newRole->id && $locationCount > 0) {
            $user->locations()->updateExistingPivot(
                $user->locations->pluck('id')->toArray(),
                ['role_id' => $newRole->id]
            );

            return Redirect::route('users.index')->with(
                'success',
                __('messages.user.updated_with_sync', ['count' => $locationCount, 'role' => $newRole->name])
            );
        }

        return Redirect::route('users.index')->with(
            'success',
            __('messages.user.updated')
        );
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        if ($user->id === $request->user()->id) {
            return Redirect::route('users.index')->with(
                'error',
                __('messages.user.cannot_delete_self')
            );
        }

        $user->delete();

        return Redirect::route('users.index')->with(
            'success',
            __('messages.user.deleted')
        );
    }

    public function restore($id): RedirectResponse
    {
        $user = User::withTrashed()->findOrFail($id);
        $user->restore();

        return Redirect::route('users.index')->with('success', __('messages.user.restored'));
    }
}

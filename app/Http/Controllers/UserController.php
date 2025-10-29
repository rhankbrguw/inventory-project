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
        $users = User::query()
            ->with("roles")
            ->when($request->input("search"), function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where("name", "like", "%{$search}%")->orWhere(
                        "email",
                        "like",
                        "%{$search}%",
                    );
                });
            })
            ->when($request->input("role"), function ($query, $role) {
                $query->whereHas(
                    "roles",
                    fn($q) => $q->where("name", "like", "%{$role}%"),
                );
            })
            ->when(
                $request->input("sort"),
                function ($query, $sort) {
                    match ($sort) {
                        "name_asc" => $query->orderBy("name", "asc"),
                        "name_desc" => $query->orderBy("name", "desc"),
                        default => $query->orderBy("name", "asc"),
                    };
                },
                function ($query) {
                    $query->orderBy("name", "asc");
                },
            )
            ->paginate(10)
            ->withQueryString();

        return Inertia::render("Users/Index", [
            "users" => UserResource::collection($users),
            "roles" => Role::orderBy("name")->get(["name"]),
            "filters" => (object) $request->only(["search", "sort", "role"]),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render("Users/Create", [
            "roles" => Type::where("group", Type::GROUP_USER_ROLE)
                ->orderBy("name")
                ->pluck("name")
                ->toArray(),
        ]);
    }

    public function store(StoreUserRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $user = User::create([
            "name" => $validated["name"],
            "email" => $validated["email"],
            "password" => Hash::make($validated["password"]),
        ]);

        $user->assignRole($validated["role"]);

        return Redirect::route("users.index")->with(
            "success",
            "Pengguna berhasil ditambahkan.",
        );
    }

    public function edit(User $user): Response
    {
        return Inertia::render("Users/Edit", [
            "user" => UserResource::make($user->load("roles")),
            "roles" => Type::where("group", Type::GROUP_USER_ROLE)
                ->orderBy("name")
                ->pluck("name")
                ->toArray(),
        ]);
    }

    public function update(
        UpdateUserRequest $request,
        User $user,
    ): RedirectResponse {
        $validated = $request->validated();

        $user->update([
            "name" => $validated["name"],
            "email" => $validated["email"],
        ]);

        $user->syncRoles($validated["role"]);

        return Redirect::route("users.index")->with(
            "success",
            "Pengguna berhasil diperbarui.",
        );
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        if ($user->id === $request->user()->id) {
            return Redirect::route("users.index")->with(
                "error",
                "Anda tidak bisa menghapus akun sendiri.",
            );
        }

        $user->delete();

        return Redirect::route("users.index")->with(
            "success",
            "Pengguna berhasil dihapus.",
        );
    }
}

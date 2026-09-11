<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\UserService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function __construct(protected UserService $userService) {}

    public function index(Request $request): Response
    {
        $viewData = $this->userService->getIndexData($request->user(), $request);

        return Inertia::render('Users/Index', $viewData);
    }

    public function create(Request $request): Response
    {
        return Inertia::render('Users/Create', [
            'roles' => $this->userService->getAssignableRoles($request->user()->level, false),
        ]);
    }

    public function store(StoreUserRequest $request): RedirectResponse
    {
        $this->userService->createUser($request->validated(), $request->user());

        return Redirect::route('users.index')->with('success', __('messages.user.created'));
    }

    public function edit(Request $request, User $user): Response
    {
        return Inertia::render('Users/Edit', [
            'user' => UserResource::make($user->load('roles')),
            'roles' => $this->userService->getAssignableRoles($request->user()->level, true),
        ]);
    }

    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $syncMessage = $this->userService->updateUser($user, $request->validated(), $request->user());
        $msg = $syncMessage ?: __('messages.user.updated');

        return Redirect::route('users.index')->with('success', $msg);
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        $success = $this->userService->deleteUser($user, $request->user());
        if (! $success) {
            return Redirect::route('users.index')->with('error', __('messages.user.cannot_delete_self'));
        }

        return Redirect::route('users.index')->with('success', __('messages.user.deleted'));
    }

    public function restore(int|string $id): RedirectResponse
    {
        $this->userService->restoreUser($id);

        return Redirect::route('users.index')->with('success', __('messages.user.restored'));
    }
}

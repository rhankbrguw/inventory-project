<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\CompleteSetupRequest;
use App\Models\SystemSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class SetupController extends Controller
{
    public function __construct(protected \App\Services\UserService $userService) {}

    public function index(): Response|\Symfony\Component\HttpFoundation\Response
    {
        if (SystemSetting::isSetupCompleted()) {
            return Inertia::location(route('login'));
        }

        return Inertia::render('Setup/Index');
    }

    public function store(CompleteSetupRequest $request): RedirectResponse
    {
        if (SystemSetting::isSetupCompleted()) {
            return redirect()->route('login')->with('error', __('messages.setup.already_done'));
        }

        try {
            $user = $this->userService->createInitialSuperAdmin($request->validated());
            Auth::login($user);

            return redirect()->route('dashboard')->with('success', __('messages.setup.success', ['name' => $user->name]));
        } catch (\Exception $e) {
            return back()->with('error', __('messages.error').': '.$e->getMessage());
        }
    }
}

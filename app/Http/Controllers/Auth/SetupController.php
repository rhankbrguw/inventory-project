<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\CompleteSetupRequest;
use App\Models\SystemSetting;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class SetupController extends Controller
{
    public function index(): Response
    {
        if (SystemSetting::isSetupCompleted()) {
            return Inertia::location(route('login'));
        }

        return Inertia::render('Setup/Index');
    }

    public function store(CompleteSetupRequest $request)
    {
        if (SystemSetting::isSetupCompleted()) {
            return redirect()->route('login')->with('error', 'Setup sudah selesai.');
        }

        try {
            DB::beginTransaction();

            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'email_verified_at' => now(),
            ]);

            $user->syncRoles(['Super Admin']);

            SystemSetting::markSetupCompleted();

            DB::commit();

            Auth::login($user);

            return redirect()->route('dashboard')->with('success', 'Setup berhasil! Selamat datang, ' . $user->name);
        } catch (\Exception $e) {
            DB::rollBack();

            return back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }
}

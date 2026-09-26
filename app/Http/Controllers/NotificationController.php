<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public const PER_PAGE = 20;

    public function index(Request $request): Response
    {
        return Inertia::render('Notifications/Index', [
            'initialNotifications' => $request->user()->notifications()->cursorPaginate(self::PER_PAGE),
        ]);
    }

    public function api(Request $request): JsonResponse
    {
        $userId = $request->user()->id;
        $notifications = \Illuminate\Support\Facades\Cache::remember("user_notifs_api_{$userId}", 30, function () use ($request) {
            return $request->user()->notifications()->cursorPaginate(self::PER_PAGE);
        });

        return \App\Http\Resources\ApiResponse::success($notifications);
    }

    public function markAsRead(Request $request, string $id): JsonResponse
    {
        $userId = $request->user()->id;
        \Illuminate\Support\Facades\Cache::forget("user_notifs_api_{$userId}");

        $request->user()
            ->unreadNotifications()
            ->where('id', $id)
            ->update(['read_at' => now()]);

        return \App\Http\Resources\ApiResponse::success(null, __('messages.notification.read'));
    }

    public function markAllRead(Request $request): JsonResponse
    {
        $userId = $request->user()->id;
        \Illuminate\Support\Facades\Cache::forget("user_notifs_api_{$userId}");

        $request->user()
            ->unreadNotifications()
            ->update(['read_at' => now()]);

        return \App\Http\Resources\ApiResponse::success(null, __('messages.notification.all_read'));
    }
}

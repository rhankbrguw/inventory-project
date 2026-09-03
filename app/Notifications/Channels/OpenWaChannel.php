<?php

namespace App\Notifications\Channels;

use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class OpenWaChannel
{
    public const DEFAULT_TIMEOUT_SECONDS = 30;

    public function send(mixed $notifiable, Notification $notification): void
    {
        $phone = $notifiable->phone;
        $hasMethod = method_exists($notification, 'toOpenWa') || method_exists($notification, 'toWhatsApp');

        if (! $phone || ! $hasMethod) {
            return;
        }

        $previousLocale = App::getLocale();
        if (method_exists($notifiable, 'preferredLocale') && $notifiable->preferredLocale()) {
            App::setLocale($notifiable->preferredLocale());
        }

        try {
            $message = method_exists($notification, 'toOpenWa')
                ? $notification->toOpenWa($notifiable)
                : $notification->toWhatsApp($notifiable);
            $chatId = $this->formatChatId($phone);
            $this->dispatchHttpRequest($chatId, $message);
        } catch (\Exception $e) {
            Log::error("OpenWaChannel error for {$phone}: {$e->getMessage()}");
        } finally {
            App::setLocale($previousLocale);
        }
    }

    private function dispatchHttpRequest(string $chatId, string $message): void
    {
        $baseUrl = $this->resolveBaseUrl();
        $apiKey = config('services.openwa.api_key', '');
        $sessionId = $this->resolveSessionId($baseUrl, $apiKey);
        $url = "{$baseUrl}/api/sessions/{$sessionId}/messages/send-text";

        $response = Http::timeout(self::DEFAULT_TIMEOUT_SECONDS)
            ->withHeaders(['X-API-Key' => $apiKey])
            ->post($url, ['chatId' => $chatId, 'text' => $message]);

        if ($response->status() === 400 && str_contains($response->body(), 'not active')) {
            Http::timeout(5)->withHeaders(['X-API-Key' => $apiKey])->post("{$baseUrl}/api/sessions/{$sessionId}/start");
            sleep(2);
            $response = Http::timeout(self::DEFAULT_TIMEOUT_SECONDS)
                ->withHeaders(['X-API-Key' => $apiKey])
                ->post($url, ['chatId' => $chatId, 'text' => $message]);
        }

        $this->logResponse($chatId, $response);
    }

    private function resolveBaseUrl(): string
    {
        $configured = rtrim(config('services.openwa.base_url', 'http://openwa:2785'), '/');
        $host = parse_url($configured, PHP_URL_HOST);
        if ($host === 'openwa' && gethostbyname('openwa') === 'openwa') {
            return str_replace('openwa', '127.0.0.1', $configured);
        }

        return $configured;
    }

    private function resolveSessionId(string $baseUrl, string $apiKey): string
    {
        $configured = config('services.openwa.session_id') ?: 'default';

        try {
            $response = Http::timeout(3)->withHeaders(['X-API-Key' => $apiKey])->get("{$baseUrl}/api/sessions");
            if (! $response->successful() || ! is_array($response->json())) {
                return $configured;
            }

            $sessions = collect($response->json());
            $active = $sessions->firstWhere('id', $configured);
            if ($active && is_array($active)) {
                $this->ensureEngineLoaded($baseUrl, $apiKey, $configured, $active);

                return $configured;
            }

            $ready = $sessions->firstWhere('status', 'ready');

            return $ready ? (string) $ready['id'] : $configured;
        } catch (\Throwable) {
            return $configured;
        }
    }

    private function ensureEngineLoaded(string $baseUrl, string $apiKey, string $sessionId, array $sessionData): void
    {
        if (empty($sessionData['engineLoaded'])) {
            Http::timeout(3)->withHeaders(['X-API-Key' => $apiKey])->post("{$baseUrl}/api/sessions/{$sessionId}/start");
        }
    }

    private function logResponse(string $chatId, mixed $response): void
    {
        if ($response->successful()) {
            $json = $response->json();
            if (isset($json['success']) && $json['success'] === false) {
                Log::warning('OpenWA returned false status:', ['detail' => $json]);
            }
        } else {
            Log::error("Failed to send WhatsApp to {$chatId}: Status {$response->status()} - {$response->body()}");
        }
    }

    private function formatChatId(string $phone): string
    {
        $digits = preg_replace('/[^0-9]/', '', $phone);
        if (str_starts_with($digits, '0')) {
            $digits = '62'.substr($digits, 1);
        } elseif (! str_starts_with($digits, '62')) {
            $digits = '62'.$digits;
        }

        return $digits.'@c.us';
    }
}

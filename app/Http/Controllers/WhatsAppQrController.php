<?php

namespace App\Http\Controllers;

use Illuminate\Http\Response;
use Illuminate\Support\Facades\Http;

class WhatsAppQrController extends Controller
{
    public const STATUS_READY = 'ready';

    public const DEFAULT_TIMEOUT_SECONDS = 5;

    public function __invoke(): Response
    {
        $baseUrl = rtrim(config('services.openwa.base_url', 'http://127.0.0.1:2785'), '/');
        $apiKey = config('services.openwa.api_key');
        $sessionId = config('services.openwa.session_id') ?: 'default';

        try {
            $sessionRes = Http::timeout(self::DEFAULT_TIMEOUT_SECONDS)->withHeaders(['X-API-Key' => $apiKey])->get("{$baseUrl}/api/sessions/{$sessionId}");
            $sessionData = $sessionRes->successful() ? $sessionRes->json() : null;

            if ($sessionData && ($sessionData['status'] ?? '') === self::STATUS_READY) {
                return $this->renderReadyView($sessionData);
            }

            $qrRes = Http::timeout(self::DEFAULT_TIMEOUT_SECONDS)->withHeaders(['X-API-Key' => $apiKey])->get("{$baseUrl}/api/sessions/{$sessionId}/qr");
            $status = $sessionData['status'] ?? ($qrRes->json('status') ?? 'Inisialisasi');

            return $this->renderPendingView($status, $qrRes->json('qrCode'));
        } catch (\Throwable $e) {
            return $this->renderPendingView("Error: {$e->getMessage()}", null, 500);
        }
    }

    private function renderReadyView(array $sessionData): Response
    {
        return response()->view('whatsapp-qr', [
            'isReady' => true,
            'phone' => $sessionData['phone'] ?? null,
            'name' => $sessionData['pushName'] ?? null,
            'qrData' => null,
            'status' => self::STATUS_READY,
        ]);
    }

    private function renderPendingView(string $status, ?string $qrData = null, int $code = 200): Response
    {
        return response()->view('whatsapp-qr', [
            'isReady' => false, 'phone' => null, 'name' => null,
            'qrData' => $qrData, 'status' => $status,
        ], $code);
    }
}

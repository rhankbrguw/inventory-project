<?php

namespace App\Notifications\Channels;

use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FonnteChannel
{
    public function send($notifiable, Notification $notification)
    {
        $phone = $notifiable->phone;

        if (!$phone) {
            Log::info("User {$notifiable->id} does not have a phone number");
            return;
        }

        if (!method_exists($notification, 'toFonnte')) {
            return;
        }

        $message = $notification->toFonnte($notifiable);
        $formattedPhone = $this->formatPhoneNumber($phone);

        Log::info("User: {$notifiable->name} (ID: {$notifiable->id})");
        Log::info("Original phone: {$phone}");
        Log::info("Formatted phone: {$formattedPhone}");
        Log::info("Message preview: " . substr($message, 0, 100) . "...");

        try {
            $payload = [
                'target' => $formattedPhone,
                'message' => $message,
                'countryCode' => '62',
            ];

            Log::info("Payload:", $payload);

            $response = Http::timeout(30)
                ->withHeaders([
                    'Authorization' => config('services.fonnte.token'),
                ])
                ->post('https://api.fonnte.com/send', $payload);

            $statusCode = $response->status();
            $responseBody = $response->body();
            $responseJson = $response->json();

            Log::info("Status Code: {$statusCode}");
            Log::info("Response Body: {$responseBody}");
            Log::info("Response JSON:", $responseJson ?? []);
            Log::info("Is Successful: " . ($response->successful() ? 'YES' : 'NO'));

            if ($response->successful()) {
                Log::info("✅ WhatsApp API call successful for {$phone}");

                if (isset($responseJson['status']) && $responseJson['status'] === false) {
                    Log::warning("⚠️ Fonnte returned false status:", [
                        'reason' => $responseJson['reason'] ?? 'unknown',
                        'detail' => $responseJson
                    ]);
                } else {
                    Log::info("✅ Message queued/sent successfully");
                }
            } else {
                Log::error("❌ Failed to send WhatsApp to {$phone}");
                Log::error("Status: {$statusCode}");
                Log::error("Body: {$responseBody}");
            }
        } catch (\Exception $e) {
            Log::error("Phone: {$phone}");
            Log::error("Error: {$e->getMessage()}");
            Log::error("Trace: {$e->getTraceAsString()}");
        }
    }

    private function formatPhoneNumber($phone)
    {
        $phone = preg_replace('/[^0-9]/', '', $phone);

        if (substr($phone, 0, 1) === '0') {
            $phone = '62' . substr($phone, 1);
        } elseif (substr($phone, 0, 2) !== '62') {
            $phone = '62' . $phone;
        }

        return $phone;
    }
}

<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class OpenWaTestCommand extends Command
{
    protected $signature = 'openwa:test {phone : Target phone number (e.g. 0812... or 62812...)} {message? : Message to send}';

    protected $description = 'Send a test WhatsApp message via OpenWA';

    public function handle(): int
    {
        $phone = $this->argument('phone');
        $chatId = $this->formatChatId($phone);
        $message = $this->argument('message') ?: 'Halo! Ini adalah pesan uji coba sistem Inventory Management.';

        $baseUrl = $this->resolveBaseUrl();
        $apiKey = config('services.openwa.api_key', '');
        $sessionId = config('services.openwa.session_id') ?: 'default';
        $url = "{$baseUrl}/api/sessions/{$sessionId}/messages/send-text";

        $this->info("Sending message to {$chatId} via {$url}...");

        return $this->dispatchTestMessage($url, $apiKey, $chatId, $message);
    }

    private function dispatchTestMessage(string $url, string $apiKey, string $chatId, string $message): int
    {
        try {
            $response = Http::timeout(30)->withHeaders(['X-API-Key' => $apiKey])->post($url, [
                'chatId' => $chatId, 'text' => $message,
            ]);

            if ($response->successful()) {
                $this->info('Message sent successfully!');
                $this->line('Response: '.$response->body());

                return Command::SUCCESS;
            }

            $this->error("Failed to send. HTTP Status {$response->status()}: {$response->body()}");

            return Command::FAILURE;
        } catch (\Throwable $e) {
            $this->error("Exception while sending message: {$e->getMessage()}");

            return Command::FAILURE;
        }
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

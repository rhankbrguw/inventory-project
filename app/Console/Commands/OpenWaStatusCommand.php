<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class OpenWaStatusCommand extends Command
{
    protected $signature = 'openwa:status {--start : Attempt to start session if stopped}';

    protected $description = 'Check OpenWA WhatsApp gateway and queue worker status';

    public function handle(): int
    {
        $this->info('=== WhatsApp (OpenWA) & Service Status ===');
        $baseUrl = $this->resolveBaseUrl();
        $apiKey = config('services.openwa.api_key', '');
        $sessionId = config('services.openwa.session_id') ?: 'default';

        $this->line("Base URL   : {$baseUrl}");
        $this->line("Session ID : {$sessionId}");

        $openWaHealthy = $this->checkOpenWa($baseUrl, $apiKey, $sessionId);
        $this->checkQueueServices();

        return $openWaHealthy ? Command::SUCCESS : Command::FAILURE;
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

    private function checkOpenWa(string $baseUrl, string $apiKey, string $sessionId): bool
    {
        try {
            $res = Http::timeout(5)->withHeaders(['X-API-Key' => $apiKey])->get("{$baseUrl}/api/sessions");
            if (! $res->successful()) {
                $this->error("OpenWA Gateway HTTP error: Status {$res->status()}");

                return false;
            }

            $sessions = collect($res->json());
            $target = $sessions->firstWhere('id', $sessionId);

            if (! $target) {
                $this->warn("Session '{$sessionId}' not found. Available: ".$sessions->pluck('id')->implode(', '));
                $this->attemptStart($baseUrl, $apiKey, $sessionId);

                return false;
            }

            $this->handleSessionStatus($baseUrl, $apiKey, $sessionId, $target);

            return true;
        } catch (\Throwable $e) {
            $this->error("Cannot connect to OpenWA at {$baseUrl}: {$e->getMessage()}");

            return false;
        }
    }

    private function handleSessionStatus(string $baseUrl, string $apiKey, string $sessionId, array $target): void
    {
        $status = strtolower($target['status'] ?? 'unknown');
        $this->info("Session Status : {$status}");

        if (in_array($status, ['stopped', 'inactive']) || $this->option('start')) {
            $this->attemptStart($baseUrl, $apiKey, $sessionId);
        }

        if (in_array($status, ['qr', 'scan_qr_code'])) {
            $this->warn("WhatsApp session needs QR Scan! Open: {$baseUrl}/api/sessions/{$sessionId}/qr");
        }
    }

    private function attemptStart(string $baseUrl, string $apiKey, string $sessionId): void
    {
        $this->line("Sending start request to session '{$sessionId}'...");
        try {
            $startRes = Http::timeout(5)->withHeaders(['X-API-Key' => $apiKey])->post("{$baseUrl}/api/sessions/{$sessionId}/start");
            $this->info("Start response: Status {$startRes->status()}");
        } catch (\Throwable $e) {
            $this->error("Failed to start session: {$e->getMessage()}");
        }
    }

    private function checkQueueServices(): void
    {
        $this->newLine();
        $this->info('=== Queue Worker Status ===');
        try {
            $failedCount = DB::table('failed_jobs')->count();
            $this->line("Failed Jobs Count : {$failedCount}");
            if (DB::getSchemaBuilder()->hasTable('jobs')) {
                $pendingCount = DB::table('jobs')->count();
                $this->line("Pending Jobs Count: {$pendingCount}");
            }
        } catch (\Throwable $e) {
            $this->warn("Could not inspect jobs table: {$e->getMessage()}");
        }
    }
}

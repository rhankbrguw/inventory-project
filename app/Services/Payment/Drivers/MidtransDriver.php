<?php

namespace App\Services\Payment\Drivers;

use App\Exceptions\ValidationException;
use App\Models\PaymentTransaction;
use App\Services\Payment\Contracts\PaymentDriverInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MidtransDriver implements PaymentDriverInterface
{
    protected string $serverKey;

    protected string $snapApiUrl;

    public function __construct()
    {
        $this->serverKey = config('midtrans.server_key', '');
        $this->snapApiUrl = config('midtrans.snap_api_url');
    }

    public function createSnapToken(Model $payable, float $amount, array $customer = [], array $items = []): array
    {
        $orderId = $this->generateOrderId($payable);
        $payload = $this->buildSnapPayload($orderId, $amount, $customer, $items);

        $response = Http::withBasicAuth($this->serverKey, '')
            ->acceptJson()
            ->post($this->snapApiUrl, $payload);

        if (! $response->successful()) {
            Log::error('Midtrans Snap Error: '.$response->body());
            throw new ValidationException(__('messages.error').': Midtrans gateway error');
        }

        $snapResponse = $response->json();

        return $this->recordPendingTransaction($payable, $orderId, $amount, $snapResponse);
    }

    public function verifyWebhookSignature(array $payload): bool
    {
        $orderId = $payload['order_id'] ?? '';
        $statusCode = $payload['status_code'] ?? '';
        $grossAmount = $payload['gross_amount'] ?? '';
        $signature = $payload['signature_key'] ?? '';

        $calculated = hash('sha512', $orderId.$statusCode.$grossAmount.$this->serverKey);

        return hash_equals($calculated, $signature);
    }

    public function checkStatus(string $orderId): ?array
    {
        $url = config('midtrans.core_api_url')."/{$orderId}/status";
        $response = Http::withBasicAuth($this->serverKey, '')->acceptJson()->get($url);

        return $response->successful() ? $response->json() : null;
    }

    public function processWebhook(array $payload): PaymentTransaction
    {
        $orderId = $payload['order_id'] ?? '';
        $transaction = PaymentTransaction::where('order_id', $orderId)->firstOrFail();

        $status = $this->mapTransactionStatus($payload);
        $transaction->update([
            'status' => $status,
            'payment_type' => $payload['payment_type'] ?? $transaction->payment_type,
            'settlement_time' => in_array($status, ['settlement', 'capture']) ? now() : null,
            'raw_response' => $payload,
        ]);

        return $transaction;
    }

    private function generateOrderId(Model $payable): string
    {
        $prefix = class_basename($payable) === 'Sell' ? 'SELL' : 'INST';

        return sprintf('%s-%s-%d-%s', $prefix, date('YmdHis'), $payable->id, substr(uniqid(), -4));
    }

    private function buildSnapPayload(string $orderId, float $amount, array $customer, array $items): array
    {
        $payload = [
            'transaction_details' => ['order_id' => $orderId, 'gross_amount' => (int) round($amount)],
            'customer_details' => [
                'first_name' => $customer['name'] ?? 'Pelanggan',
                'email' => $customer['email'] ?? 'customer@example.com',
                'phone' => $customer['phone'] ?? '08123456789',
            ],
            'item_details' => empty($items) ? [['id' => '1', 'price' => (int) round($amount), 'quantity' => 1, 'name' => 'Pembayaran Tagihan']] : $items,
        ];

        $webhookUrl = url('/payment/webhook/midtrans');
        if (! str_contains($webhookUrl, 'localhost')) {
            $payload['override_notification_urls'] = [$webhookUrl];
        }

        return $payload;
    }

    private function recordPendingTransaction(Model $payable, string $orderId, float $amount, array $snapResponse): array
    {
        PaymentTransaction::create([
            'payable_type' => get_class($payable),
            'payable_id' => $payable->id,
            'order_id' => $orderId,
            'driver' => 'midtrans',
            'snap_token' => $snapResponse['token'] ?? null,
            'payment_url' => $snapResponse['redirect_url'] ?? null,
            'gross_amount' => $amount,
            'status' => PaymentTransaction::STATUS_PENDING,
            'raw_response' => $snapResponse,
        ]);

        return ['token' => $snapResponse['token'] ?? null, 'redirect_url' => $snapResponse['redirect_url'] ?? null, 'order_id' => $orderId];
    }

    private function mapTransactionStatus(array $payload): string
    {
        $transactionStatus = $payload['transaction_status'] ?? '';
        $fraudStatus = $payload['fraud_status'] ?? '';

        if ($transactionStatus === 'capture') {
            return $fraudStatus === 'challenge' ? PaymentTransaction::STATUS_PENDING : PaymentTransaction::STATUS_SETTLEMENT;
        }
        if ($transactionStatus === 'settlement') {
            return PaymentTransaction::STATUS_SETTLEMENT;
        }
        if ($transactionStatus === 'pending') {
            return PaymentTransaction::STATUS_PENDING;
        }
        if (in_array($transactionStatus, ['deny', 'cancel', 'expire'])) {
            return PaymentTransaction::STATUS_CANCEL;
        }

        return PaymentTransaction::STATUS_PENDING;
    }
}

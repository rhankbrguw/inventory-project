<?php

namespace App\Services\Payment\Drivers;

use App\Models\PaymentTransaction;
use App\Services\Payment\Contracts\PaymentDriverInterface;
use Illuminate\Database\Eloquent\Model;

class MockPaymentDriver implements PaymentDriverInterface
{
    public function createSnapToken(Model $payable, float $amount, array $customer = [], array $items = []): array
    {
        $orderId = sprintf('MOCK-%s-%d', date('YmdHis'), $payable->id);
        $token = 'mock_snap_'.uniqid();

        PaymentTransaction::create([
            'payable_type' => get_class($payable),
            'payable_id' => $payable->id,
            'order_id' => $orderId,
            'driver' => 'mock',
            'snap_token' => $token,
            'payment_url' => null,
            'payment_type' => 'mock_qris',
            'gross_amount' => $amount,
            'status' => PaymentTransaction::STATUS_PENDING,
            'raw_response' => ['mock' => true],
        ]);

        return ['token' => $token, 'redirect_url' => null, 'order_id' => $orderId];
    }

    public function verifyWebhookSignature(array $payload): bool
    {
        return true;
    }

    public function processWebhook(array $payload): PaymentTransaction
    {
        $orderId = $payload['order_id'] ?? '';
        $transaction = PaymentTransaction::where('order_id', $orderId)->firstOrFail();
        $transaction->update([
            'status' => PaymentTransaction::STATUS_SETTLEMENT,
            'settlement_time' => now(),
            'raw_response' => $payload,
        ]);

        return $transaction;
    }
}

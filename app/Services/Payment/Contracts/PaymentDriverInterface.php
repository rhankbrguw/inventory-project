<?php

namespace App\Services\Payment\Contracts;

use App\Models\PaymentTransaction;
use Illuminate\Database\Eloquent\Model;

interface PaymentDriverInterface
{
    public function createSnapToken(Model $payable, float $amount, array $customer = [], array $items = []): array;

    public function verifyWebhookSignature(array $payload): bool;

    public function processWebhook(array $payload): PaymentTransaction;
}

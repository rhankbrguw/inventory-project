<?php

namespace App\Http\Controllers;

use App\Services\Payment\PaymentManager;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PaymentWebhookController extends Controller
{
    public function handleMidtrans(Request $request, PaymentManager $paymentManager): JsonResponse
    {
        $payload = $request->all();
        Log::info('Midtrans Webhook Received:', $payload);

        try {
            $transaction = $paymentManager->handleWebhook($payload, 'midtrans');

            return \App\Http\Resources\ApiResponse::success([
                'order_id' => $transaction->order_id,
                'transaction_status' => $transaction->status,
            ]);
        } catch (\Exception $e) {
            Log::error('Midtrans Webhook Error: '.$e->getMessage());

            return \App\Http\Resources\ApiResponse::error($e->getMessage(), 'WEBHOOK_PROCESSING_FAILED', 400);
        }
    }
}

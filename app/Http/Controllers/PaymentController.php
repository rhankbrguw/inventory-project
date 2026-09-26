<?php

namespace App\Http\Controllers;

use App\Models\Installment;
use App\Models\PaymentTransaction;
use App\Models\Purchase;
use App\Models\Sell;
use App\Services\Payment\PaymentManager;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function createSellSnapToken(Sell $sell, PaymentManager $paymentManager): JsonResponse
    {
        $sell->loadMissing(['customer', 'targetLocation', 'items.product']);
        $driver = config('midtrans.server_key') ? 'midtrans' : 'mock';
        $result = $paymentManager->createSellSnapToken($sell, $driver);

        return \App\Http\Resources\ApiResponse::success($result);
    }

    public function createPurchaseSnapToken(Purchase $purchase, PaymentManager $paymentManager): JsonResponse
    {
        $purchase->loadMissing(['supplier', 'fromLocation', 'items.product']);
        $driver = config('midtrans.server_key') ? 'midtrans' : 'mock';
        $result = $paymentManager->createPurchaseSnapToken($purchase, $driver);

        return \App\Http\Resources\ApiResponse::success($result);
    }

    public function createInstallmentSnapToken(Installment $installment, PaymentManager $paymentManager): JsonResponse
    {
        $parent = $installment->installmentable()->first();
        if ($parent instanceof Sell) {
            $parent->loadMissing(['customer', 'targetLocation']);
        } elseif ($parent) {
            $parent->loadMissing(['supplier', 'fromLocation']);
        }
        $driver = config('midtrans.server_key') ? 'midtrans' : 'mock';
        $result = $paymentManager->createInstallmentSnapToken($installment, $driver);

        return \App\Http\Resources\ApiResponse::success($result);
    }

    public function verifyPayment(Request $request, string $orderId, PaymentManager $paymentManager): JsonResponse
    {
        try {
            $transaction = $paymentManager->verifyAndSettle($orderId, $request->input('result'));

            return \App\Http\Resources\ApiResponse::success([
                'order_id' => $transaction->order_id,
                'transaction_status' => $transaction->status,
                'is_success' => $transaction->isSuccess(),
            ]);
        } catch (\Exception $e) {
            return \App\Http\Resources\ApiResponse::error($e->getMessage(), 'PAYMENT_VERIFICATION_FAILED', 400);
        }
    }

    public function checkStatus(string $orderId): JsonResponse
    {
        $tx = PaymentTransaction::where('order_id', $orderId)->first();
        if (! $tx) {
            return \App\Http\Resources\ApiResponse::error(__('messages.not_found'), 'NOT_FOUND', 404);
        }

        return \App\Http\Resources\ApiResponse::success([
            'order_id' => $tx->order_id,
            'status' => $tx->status,
            'is_success' => $tx->isSuccess(),
        ]);
    }
}

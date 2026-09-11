<?php

namespace App\Services\Payment;

use App\Models\Installment;
use App\Models\PaymentTransaction;
use App\Models\Purchase;
use App\Models\Sell;
use App\Services\Payment\Contracts\PaymentDriverInterface;
use App\Services\Payment\Drivers\MidtransDriver;
use App\Services\Payment\Drivers\MockPaymentDriver;
use Illuminate\Database\Eloquent\Model;

class PaymentManager
{
    protected PaymentSettlementService $settlementService;

    public function __construct(PaymentSettlementService $settlementService)
    {
        $this->settlementService = $settlementService;
    }

    public function getDriver(string $name = 'midtrans'): PaymentDriverInterface
    {
        return match ($name) {
            'mock' => new MockPaymentDriver,
            default => new MidtransDriver,
        };
    }

    public function createSellSnapToken(Sell $sell, string $driverName = 'midtrans'): array
    {
        $customer = [
            'name' => $sell->customer?->name ?? ($sell->targetLocation?->name ? 'Cabang '.$sell->targetLocation->name : 'Walk-in Customer'),
            'email' => $sell->customer?->email ?? 'customer@inventory.local',
            'phone' => $sell->customer?->phone ?? '08123456789',
        ];

        $items = $sell->items->map(fn ($item) => [
            'id' => (string) $item->product_id,
            'price' => (int) round((float) ($item->sell_price ?? $item->price ?? 0)),
            'quantity' => (int) $item->quantity,
            'name' => mb_substr($item->product?->name ?? 'Item Penjualan', 0, 50),
        ])->toArray();

        return $this->getDriver($driverName)->createSnapToken($sell, (float) $sell->total_price, $customer, $items);
    }

    public function createPurchaseSnapToken(Purchase $purchase, string $driverName = 'midtrans'): array
    {
        $customer = [
            'name' => $purchase->supplier?->name ?? ($purchase->fromLocation?->name ? 'Gudang '.$purchase->fromLocation->name : 'Supplier'),
            'email' => $purchase->supplier?->email ?? 'supplier@inventory.local',
            'phone' => $purchase->supplier?->phone ?? '08123456789',
        ];

        $items = $purchase->items->map(fn ($item) => [
            'id' => (string) $item->product_id,
            'price' => (int) round($item->cost_per_unit),
            'quantity' => (int) $item->quantity,
            'name' => mb_substr($item->product?->name ?? 'Item Pembelian', 0, 50),
        ])->toArray();

        return $this->getDriver($driverName)->createSnapToken($purchase, (float) $purchase->total_cost, $customer, $items);
    }

    public function createInstallmentSnapToken(Installment $installment, string $driverName = 'midtrans'): array
    {
        $parent = $installment->installmentable()->first();
        $customer = $this->resolveCustomerPayload($parent);

        $items = [[
            'id' => 'INST-'.$installment->id,
            'price' => (int) round($installment->amount),
            'quantity' => 1,
            'name' => 'Cicilan Ke-'.$installment->installment_number,
        ]];

        return $this->getDriver($driverName)->createSnapToken($installment, (float) $installment->amount, $customer, $items);
    }

    private function resolveCustomerPayload(?Model $parent): array
    {
        if ($parent instanceof Sell) {
            $dest = $parent->targetLocation?->name ? 'Cabang '.$parent->targetLocation->name : 'Walk-in Customer';

            return [
                'name' => $parent->customer?->name ?? $dest,
                'email' => $parent->customer?->email ?? 'customer@inventory.local',
                'phone' => $parent->customer?->phone ?? '08123456789',
            ];
        }

        if ($parent instanceof Purchase) {
            $source = $parent->fromLocation?->name ? 'Gudang '.$parent->fromLocation->name : 'Supplier';

            return [
                'name' => $parent->supplier?->name ?? $source,
                'email' => $parent->supplier?->email ?? 'supplier@inventory.local',
                'phone' => $parent->supplier?->phone ?? '08123456789',
            ];
        }

        return [
            'name' => 'Customer',
            'email' => 'customer@inventory.local',
            'phone' => '08123456789',
        ];
    }

    public function handleWebhook(array $payload, string $driverName = 'midtrans'): PaymentTransaction
    {
        $driver = $this->getDriver($driverName);
        if (! $driver->verifyWebhookSignature($payload)) {
            abort(403, 'Invalid Midtrans webhook signature');
        }

        $transaction = $driver->processWebhook($payload);
        $this->settlementService->settle($transaction);

        return $transaction;
    }

    public function verifyAndSettle(string $orderId, ?array $clientResult = null): PaymentTransaction
    {
        $driverName = str_starts_with($orderId, 'MOCK-') ? 'mock' : 'midtrans';
        $driver = $this->getDriver($driverName);
        $statusData = $driver instanceof MidtransDriver ? $driver->checkStatus($orderId) : null;
        $dataToProcess = $statusData ?? $clientResult;
        if ($dataToProcess && is_array($dataToProcess)) {
            $transaction = $driver->processWebhook($dataToProcess);
            $this->settlementService->settle($transaction);

            return $transaction;
        }

        return PaymentTransaction::where('order_id', $orderId)->firstOrFail();
    }
}

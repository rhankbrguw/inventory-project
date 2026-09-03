<?php

namespace App\Http\Controllers\Transaction;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSellRequest;
use App\Http\Resources\Transaction\SellResource;
use App\Models\Sell;
use App\Services\SellCheckoutDataService;
use App\Services\SellCheckoutService;
use App\Services\SellFulfillmentService;
use App\Services\SellWorkflowService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class SellController extends Controller
{
    public function __construct(
        protected SellCheckoutService $checkoutService,
        protected SellCheckoutDataService $checkoutDataService,
        protected SellFulfillmentService $fulfillmentService,
        protected SellWorkflowService $workflowService
    ) {}

    public function create(Request $request): Response
    {
        $user = Auth::user();
        $viewData = $this->checkoutDataService->getCreateViewData($user, $request, $this->checkoutService);

        return Inertia::render('Transactions/Sells/Create', $viewData);
    }

    public function store(StoreSellRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $this->authorize('createAtLocation', [Sell::class, $validated['location_id']]);

        $totalPrice = collect($validated['items'])->sum(fn ($item) => $item['quantity'] * $item['sell_price']);
        $targetLocationId = $validated['target_location_id'] ?? null;
        $terms = (int) ($validated['installment_terms'] ?? 1);

        $this->checkoutService->createSell(
            $request->user(),
            $validated,
            $totalPrice,
            $targetLocationId,
            $terms,
            $terms > 1 ? (float) ($validated['interest_rate'] ?? 0) : 0.0,
            $validated['sales_channel_id'] ?? null,
            $targetLocationId ? Sell::STATUS_PENDING_APPROVAL : Sell::STATUS_COMPLETED
        );

        return Redirect::route('transactions.index')->with('success', __('messages.sell.created'));
    }

    public function show(Sell $sell): Response
    {
        $this->authorize('view', $sell);
        $sell->load([
            'location', 'customer', 'targetLocation', 'salesChannel', 'user', 'approver', 'rejector', 'paymentMethod', 'type', 'installments',
            'items.product' => fn ($q) => $q->withTrashed()->withoutGlobalScopes(),
            'items.salesChannel',
            'stockMovements.product' => fn ($q) => $q->withTrashed()->withoutGlobalScopes(),
            'stockMovements.salesChannel',
        ]);

        $destId = $sell->getDestinationLocationId();
        $user = Auth::user();
        $isPaymentSufficient = $this->workflowService->isPaymentSufficientForShipment($sell);

        return Inertia::render('Transactions/Sells/Show', [
            'sell' => SellResource::make($sell),
            'canApprove' => $sell->status === Sell::STATUS_PENDING_APPROVAL && $destId && $user->can('approve', $sell),
            'canShip' => $sell->status === Sell::STATUS_APPROVED && $user->can('ship', $sell),
            'canReceive' => $sell->status === Sell::STATUS_SHIPPING && $destId && $user->can('receive', $sell),
            'canPay' => $user->can('pay', $sell),
            'isPaymentSufficient' => $isPaymentSufficient,
        ]);
    }

    public function approve(Sell $sell): RedirectResponse
    {
        $this->authorize('approve', $sell);
        if ($sell->status !== Sell::STATUS_PENDING_APPROVAL) {
            return back()->with('error', __('messages.sell.invalid_status'));
        }
        $this->workflowService->approve($sell, Auth::user());

        return back()->with('success', __('messages.sell.approved'));
    }

    public function reject(Request $request, Sell $sell): RedirectResponse
    {
        $this->authorize('reject', $sell);
        if ($sell->status !== Sell::STATUS_PENDING_APPROVAL) {
            return back()->with('error', __('messages.sell.invalid_status'));
        }
        $this->workflowService->reject($sell, Auth::user(), $request->input('rejection_reason', ''));

        return back()->with('success', __('messages.sell.rejected'));
    }

    public function ship(Sell $sell): RedirectResponse
    {
        $this->authorize('ship', $sell);
        if ($sell->status !== Sell::STATUS_APPROVED) {
            return back()->with('error', __('messages.sell.not_approved'));
        }
        if (! $this->workflowService->isPaymentSufficientForShipment($sell)) {
            return back()->with('error', __('messages.sell.payment_required_before_shipping'));
        }
        $this->fulfillmentService->ship($sell, Auth::user());

        return back()->with('success', __('messages.sell.shipped'));
    }

    public function receive(Request $request, Sell $sell): RedirectResponse
    {
        $this->authorize('receive', $sell);
        if ($sell->status !== Sell::STATUS_SHIPPING || ! $sell->getDestinationLocationId()) {
            return back()->with('error', __('messages.sell.invalid_status'));
        }
        $request->validate(['receipt_photo' => ['required', 'image', 'max:'.TransactionController::MAX_RECEIPT_PHOTO_KB]]);
        $photoPath = $request->file('receipt_photo')->store('receipts', 'public');
        $this->fulfillmentService->receive($sell, $request->user(), $photoPath);

        return back()->with('success', __('messages.sell.received'));
    }
}

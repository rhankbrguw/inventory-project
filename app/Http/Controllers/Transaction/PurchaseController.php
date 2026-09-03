<?php

namespace App\Http\Controllers\Transaction;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePurchaseRequest;
use App\Http\Resources\Transaction\PurchaseResource;
use App\Models\Purchase;
use App\Services\PurchaseCreationDataService;
use App\Services\PurchaseCreationService;
use App\Services\PurchaseFulfillmentService;
use App\Services\PurchaseWorkflowService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class PurchaseController extends Controller
{
    public function __construct(
        protected PurchaseCreationService $creationService,
        protected PurchaseCreationDataService $creationDataService,
        protected PurchaseFulfillmentService $fulfillmentService,
        protected PurchaseWorkflowService $workflowService
    ) {}

    public function create(Request $request): Response
    {
        $viewData = $this->creationDataService->getCreateViewData(Auth::user(), $request);

        return Inertia::render('Transactions/Purchases/Create', $viewData);
    }

    public function store(StorePurchaseRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $user = $request->user();
        $this->authorize('createAtLocation', [Purchase::class, $validated['location_id']]);

        $isInternal = ! empty($validated['from_location_id']);
        $initialStatus = $isInternal ? Purchase::STATUS_PENDING_APPROVAL : Purchase::STATUS_COMPLETED;
        $purchase = $this->creationService->create($validated, $user->id, $initialStatus);

        if ($initialStatus === Purchase::STATUS_PENDING_APPROVAL && $isInternal) {
            $this->fulfillmentService->notifyWarehouseManagers($purchase, $user->name);
        }

        $supplierId = $validated['supplier_id'];
        $user->purchaseCartItems()
            ->where(fn ($q) => is_null($supplierId) ? $q->whereNull('supplier_id') : $q->where('supplier_id', $supplierId))
            ->whereIn('product_id', array_column($validated['items'], 'product_id'))
            ->delete();

        $message = $isInternal ? __('messages.transfer.created') : __('messages.purchase.created');

        return Redirect::route('transactions.index')->with('success', $message);
    }

    public function show(Purchase $purchase): Response
    {
        $this->authorize('view', $purchase);
        $purchase->load([
            'location', 'fromLocation', 'supplier', 'user', 'paymentMethod', 'type', 'installments', 'approver', 'rejector',
            'items.product' => fn ($q) => $q->withTrashed()->withoutGlobalScopes(),
        ]);

        $user = Auth::user();
        $isPaymentSufficient = $this->workflowService->isPaymentSufficientForShipment($purchase);

        return Inertia::render('Transactions/Purchases/Show', [
            'purchase' => PurchaseResource::make($purchase),
            'canApprove' => $user->can('approve', $purchase) && $purchase->status === Purchase::STATUS_PENDING_APPROVAL,
            'canReject' => $user->can('reject', $purchase) && $purchase->status === Purchase::STATUS_PENDING_APPROVAL,
            'canShip' => $user->can('ship', $purchase) && $purchase->status === Purchase::STATUS_APPROVED,
            'canReceive' => $user->can('receive', $purchase) && $purchase->status === Purchase::STATUS_SHIPPING,
            'canPay' => $user->can('pay', $purchase),
            'isPaymentSufficient' => $isPaymentSufficient,
        ]);
    }

    public function approve(Purchase $purchase): RedirectResponse
    {
        $this->authorize('approve', $purchase);
        if ($purchase->status !== Purchase::STATUS_PENDING_APPROVAL) {
            return back()->with('error', __('messages.transfer.invalid_status'));
        }
        $this->workflowService->approve($purchase, Auth::user());

        return back()->with('success', __('messages.transfer.approved'));
    }

    public function reject(Request $request, Purchase $purchase): RedirectResponse
    {
        $this->authorize('reject', $purchase);
        if ($purchase->status !== Purchase::STATUS_PENDING_APPROVAL) {
            return back()->with('error', __('messages.transfer.invalid_status'));
        }
        $this->workflowService->reject($purchase, Auth::user(), $request->input('rejection_reason', ''));

        return back()->with('success', __('messages.transfer.rejected'));
    }

    public function ship(Purchase $purchase): RedirectResponse
    {
        $this->authorize('ship', $purchase);
        if ($purchase->status !== Purchase::STATUS_APPROVED) {
            return back()->with('error', __('messages.transfer.invalid_status'));
        }
        if (! $this->workflowService->isPaymentSufficientForShipment($purchase)) {
            return back()->with('error', __('messages.purchase.payment_required_before_shipping'));
        }
        $this->fulfillmentService->ship($purchase, Auth::user());

        return back()->with('success', __('messages.transfer.shipped'));
    }

    public function receive(Request $request, Purchase $purchase): RedirectResponse
    {
        $this->authorize('receive', $purchase);
        $request->validate(['receipt_photo' => ['required', 'image', 'max:'.TransactionController::MAX_RECEIPT_PHOTO_KB]]);
        $photoPath = $request->file('receipt_photo')->store('receipts', 'public');
        $this->fulfillmentService->receive($purchase, $photoPath);

        return back()->with('success', __('messages.transfer.received'));
    }
}

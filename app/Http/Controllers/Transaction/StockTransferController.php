<?php

namespace App\Http\Controllers\Transaction;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreStockTransferRequest;
use App\Http\Resources\Transaction\TransferResource;
use App\Models\StockTransfer;
use App\Services\StockTransferService;
use App\Services\StockTransferViewDataService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class StockTransferController extends Controller
{
    public function __construct(
        protected StockTransferService $stockTransferService,
        protected StockTransferViewDataService $viewDataService
    ) {}

    public function create(): Response
    {
        $viewData = $this->viewDataService->getCreateViewData(Auth::user());

        return Inertia::render('Transactions/Transfers/Create', $viewData);
    }

    public function store(StoreStockTransferRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $this->authorize('createAtLocation', [StockTransfer::class, $validated['from_location_id']]);
        $this->stockTransferService->create($validated, Auth::user());

        return Redirect::route('transactions.index')->with('success', __('messages.transfer.created'));
    }

    public function approve(StockTransfer $stockTransfer): RedirectResponse
    {
        $this->authorize('accept', $stockTransfer);
        if ($stockTransfer->status !== StockTransfer::STATUS_PENDING_APPROVAL) {
            return back()->with('error', __('messages.transfer.invalid_status'));
        }
        $this->stockTransferService->approve($stockTransfer, Auth::user());

        return back()->with('success', __('messages.transfer.approved'));
    }

    public function reject(Request $request, StockTransfer $stockTransfer): RedirectResponse
    {
        $this->authorize('reject', $stockTransfer);
        if ($stockTransfer->status !== StockTransfer::STATUS_PENDING_APPROVAL) {
            return back()->with('error', __('messages.transfer.invalid_status'));
        }
        $request->validate(['rejection_reason' => ['required', 'string', 'min:3']]);
        $this->stockTransferService->reject($stockTransfer, Auth::user(), $request->input('rejection_reason'));

        return back()->with('success', __('messages.transfer.rejected'));
    }

    public function ship(StockTransfer $stockTransfer): RedirectResponse
    {
        $this->authorize('ship', $stockTransfer);
        if ($stockTransfer->status !== StockTransfer::STATUS_APPROVED) {
            return back()->with('error', __('messages.transfer.not_approved'));
        }
        $this->stockTransferService->ship($stockTransfer, Auth::user());

        return back()->with('success', __('messages.transfer.shipped'));
    }

    public function receive(Request $request, StockTransfer $stockTransfer): RedirectResponse
    {
        $this->authorize('receive', $stockTransfer);
        if ($stockTransfer->status !== StockTransfer::STATUS_SHIPPING) {
            return back()->with('error', __('messages.transfer.not_shipped'));
        }
        $request->validate(['receipt_photo' => ['required', 'image', 'max:'.TransactionController::MAX_RECEIPT_PHOTO_KB]]);
        $photoPath = $request->file('receipt_photo')->store('receipts', 'public');
        $this->stockTransferService->receive($stockTransfer, $request->user(), $photoPath);

        return back()->with('success', __('messages.transfer.received'));
    }

    public function show(StockTransfer $stockTransfer): Response
    {
        $this->authorize('view', $stockTransfer);
        $user = Auth::user();
        $stockTransfer->load(['fromLocation', 'toLocation', 'user', 'receiver', 'rejector', 'items.product']);

        return Inertia::render('Transactions/Transfers/Show', [
            'transfer' => new TransferResource($stockTransfer),
            'canApprove' => $stockTransfer->status === StockTransfer::STATUS_PENDING_APPROVAL && $user->can('accept', $stockTransfer),
            'canShip' => $stockTransfer->status === StockTransfer::STATUS_APPROVED && $user->can('ship', $stockTransfer),
            'canReceive' => $stockTransfer->status === StockTransfer::STATUS_SHIPPING && $user->can('receive', $stockTransfer),
        ]);
    }
}

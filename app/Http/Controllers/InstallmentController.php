<?php

namespace App\Http\Controllers;

use App\Models\Installment;
use App\Services\InstallmentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;

class InstallmentController extends Controller
{
    public function __construct(private InstallmentService $installmentService)
    {
    }

    /**
     * Mark an installment as paid and reconcile is the parent transaction's payment status.
     */
    public function pay(Request $request, Installment $installment): RedirectResponse
    {
        $this->authorize('pay', $installment);

        abort_if($installment->isPaid(), 403, __('messages.installment.already_paid'));

        $unpaidPrior = Installment::where('installmentable_type', $installment->installmentable_type)
            ->where('installmentable_id', $installment->installmentable_id)
            ->where('installment_number', '<', $installment->installment_number)
            ->where('status', '!=', Installment::STATUS_PAID)
            ->orderBy('installment_number')
            ->first();

        abort_if($unpaidPrior !== null, 422, __('messages.installment.prior_unpaid', ['number' => $unpaidPrior?->installment_number]));

        $validated = $request->validate([
            'paid_amount' => ['required', 'numeric', 'min:0.01'],
            'paid_date' => ['required', 'date', 'before_or_equal:today'],
        ]);

        $this->installmentService->pay(
            $installment,
            (float) $validated['paid_amount'],
            $validated['paid_date'],
        );

        return Redirect::back()->with('success', __('messages.installment.paid'));
    }
}

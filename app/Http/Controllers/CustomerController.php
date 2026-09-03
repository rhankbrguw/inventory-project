<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCustomerRequest;
use App\Http\Requests\UpdateCustomerRequest;
use App\Http\Resources\CustomerResource;
use App\Http\Resources\TypeResource;
use App\Models\Customer;
use App\Services\CustomerService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    public function __construct(protected CustomerService $customerService)
    {
        $this->authorizeResource(Customer::class, 'customer');
    }

    public function index(Request $request): Response
    {
        $viewData = $this->customerService->getIndexData($request->user(), $request);

        return Inertia::render('Customers/Index', $viewData);
    }

    public function create(): Response
    {
        return Inertia::render('Customers/Create', [
            'customerTypes' => TypeResource::collection($this->customerService->getCustomerTypes()),
        ]);
    }

    public function store(StoreCustomerRequest $request): RedirectResponse
    {
        $customer = $this->customerService->createCustomer($request->validated(), $request->user());
        if ($request->boolean('_from_modal')) {
            return Redirect::back()->with('newCustomer', $customer)->with('success', __('messages.customer.created_from_modal'));
        }

        return Redirect::route('customers.index')->with('success', __('messages.customer.created'));
    }

    public function edit(Customer $customer): Response
    {
        $customer->load('type');

        return Inertia::render('Customers/Edit', [
            'customer' => CustomerResource::make($customer),
            'customerTypes' => TypeResource::collection($this->customerService->getCustomerTypes()),
        ]);
    }

    public function update(UpdateCustomerRequest $request, Customer $customer): RedirectResponse
    {
        $this->customerService->updateCustomer($customer, $request->validated());

        return Redirect::route('customers.index')->with('success', __('messages.customer.updated'));
    }

    public function destroy(Customer $customer): RedirectResponse
    {
        $this->customerService->deleteCustomer($customer);

        return Redirect::route('customers.index')->with('success', __('messages.customer.deleted'));
    }

    public function restore(int|string $id): RedirectResponse
    {
        $this->customerService->restoreCustomer($id);

        return Redirect::route('customers.index')->with('success', __('messages.customer.restored'));
    }
}

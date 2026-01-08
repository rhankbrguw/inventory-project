<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCustomerRequest;
use App\Http\Requests\UpdateCustomerRequest;
use App\Http\Resources\CustomerResource;
use App\Http\Resources\TypeResource;
use App\Models\Customer;
use App\Models\Role;
use App\Models\Type;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    private function getCustomerTypesForForm()
    {
        return Type::where('group', Type::GROUP_CUSTOMER)
            ->where('code', '!=', Customer::CODE_BRANCH_CUSTOMER)
            ->get();
    }

    private function getAllCustomerTypes()
    {
        return Type::where('group', Type::GROUP_CUSTOMER)->get();
    }

    public function index(Request $request): Response
    {
        $user = $request->user();

        $customers = Customer::query()
            ->withTrashed()
            ->with(['type'])
            ->accessibleBy($user)
            ->when($request->input('search'), function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%");
                });
            })
            ->when($request->input('status'), function ($query, $status) {
                if ($status === 'active') {
                    $query->whereNull('deleted_at');
                } elseif ($status === 'inactive') {
                    $query->whereNotNull('deleted_at');
                }
            })
            ->when($request->input('type_id'), function ($query, $typeId) {
                if ($typeId !== 'all') {
                    $query->where('type_id', $typeId);
                }
            })
            ->when($request->input('sort'), function ($query, $sort) {
                match ($sort) {
                    'name_asc' => $query->orderBy('name', 'asc'),
                    'name_desc' => $query->orderBy('name', 'desc'),
                    'oldest' => $query->orderBy('created_at', 'asc'),
                    default => $query->latest('created_at'),
                };
            }, fn ($query) => $query->latest('created_at'))
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Customers/Index', [
            'customers' => CustomerResource::collection($customers),
            'filters' => (object) $request->only(['search', 'sort', 'type_id']),
            'customerTypes' => TypeResource::collection($this->getAllCustomerTypes()),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Customers/Create', [
            'customerTypes' => TypeResource::collection($this->getCustomerTypesForForm()),
        ]);
    }

    public function store(StoreCustomerRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $user = $request->user();

        if ($user->level === Role::LEVEL_SUPER_ADMIN) {
            $validated['location_id'] = null;
        } else {
            $validated['location_id'] = $user->locations->first()?->id;
        }

        $customer = Customer::create($validated);

        if ($request->boolean('_from_modal')) {
            return Redirect::back()
                ->with('newCustomer', $customer)
                ->with('success', 'Pelanggan baru berhasil ditambahkan.');
        }

        return Redirect::route('customers.index')
            ->with('success', 'Pelanggan berhasil ditambahkan.');
    }

    public function edit(Customer $customer): Response
    {
        $customer->load('type');

        return Inertia::render('Customers/Edit', [
            'customer' => CustomerResource::make($customer),
            'customerTypes' => TypeResource::collection($this->getCustomerTypesForForm()),
        ]);
    }

    public function update(UpdateCustomerRequest $request, Customer $customer): RedirectResponse
    {
        $customer->update($request->validated());

        return Redirect::route('customers.index')
            ->with('success', 'Pelanggan berhasil diperbarui.');
    }

    public function destroy(Customer $customer): RedirectResponse
    {
        $customer->delete();

        return Redirect::route('customers.index')
            ->with('success', 'Pelanggan berhasil dinonaktifkan.');
    }

    public function restore($id): RedirectResponse
    {
        $customer = Customer::withTrashed()->findOrFail($id);
        $customer->restore();

        return Redirect::route('customers.index')
            ->with('success', 'Pelanggan berhasil diaktifkan kembali.');
    }
}

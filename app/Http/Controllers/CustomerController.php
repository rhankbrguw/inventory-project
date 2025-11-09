<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCustomerRequest;
use App\Http\Requests\UpdateCustomerRequest;
use App\Http\Resources\CustomerResource;
use App\Http\Resources\TypeResource;
use App\Models\Customer;
use App\Models\Type;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class CustomerController extends Controller
{
    private function getCustomerTypes()
    {
        return Type::where('group', Type::GROUP_CUSTOMER)->get();
    }

    public function index(Request $request)
    {
        $customers = Customer::query()
            ->with(['type'])
            ->when($request->input('search'), function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%");
                });
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
            }, function ($query) {
                $query->latest('created_at');
            })
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Customers/Index', [
            'customers' => CustomerResource::collection($customers),
            'filters' => (object) $request->only(['search', 'sort', 'type_id']),
            'customerTypes' => TypeResource::collection($this->getCustomerTypes()),
        ]);
    }

    public function create()
    {
        return Inertia::render('Customers/Create', [
            'customerTypes' => TypeResource::collection($this->getCustomerTypes()),
        ]);
    }

    public function store(StoreCustomerRequest $request)
    {
        $customer = Customer::create($request->validated());

        if ($request->boolean('_from_modal')) {
            return Redirect::back()->with('newCustomer', $customer)
                ->with('success', 'Pelanggan baru berhasil ditambahkan.');
        }

        return Redirect::route('customers.index')->with('success', 'Pelanggan berhasil ditambahkan.');
    }



    public function edit(Customer $customer)
    {
        $customer->load('type');
        return Inertia::render('Customers/Edit', [
            'customer' => CustomerResource::make($customer),
            'customerTypes' => TypeResource::collection($this->getCustomerTypes()),
        ]);
    }

    public function update(UpdateCustomerRequest $request, Customer $customer)
    {
        $customer->update($request->validated());

        return Redirect::route('customers.index')->with('success', 'Pelanggan berhasil diperbarui.');
    }

    public function destroy(Customer $customer)
    {
        $customer->delete();

        return Redirect::route('customers.index')->with('success', 'Pelanggan berhasil dihapus.');
    }
}

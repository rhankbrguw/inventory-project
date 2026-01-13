<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSupplierRequest;
use App\Http\Requests\UpdateSupplierRequest;
use App\Http\Resources\SupplierResource;
use App\Models\Supplier;
use App\Models\Role;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class SupplierController extends Controller
{
    public function index(Request $request): Response
    {
        $user = Auth::user();

        $suppliers = Supplier::query()
            ->accessibleBy($user)
            ->when($request->input('search'), function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('contact_person', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when($request->input('status'), function ($query, $status) {
                if ($status === 'active') {
                    $query->whereNull('deleted_at');
                } elseif ($status === 'inactive') {
                    $query->whereNotNull('deleted_at');
                }
            })
            ->when($request->input('sort'), function ($query, $sort) {
                match ($sort) {
                    'name_asc' => $query->orderBy('name', 'asc'),
                    'name_desc' => $query->orderBy('name', 'desc'),
                    default => $query->orderBy('name', 'asc'),
                };
            }, fn($query) => $query->orderBy('name', 'asc'))
            ->withTrashed()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Suppliers/Index', [
            'suppliers' => SupplierResource::collection($suppliers),
            'filters' => (object) $request->only(['search', 'sort', 'status']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Suppliers/Create');
    }

    public function store(StoreSupplierRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $user = $request->user();

        if ($user->level === Role::LEVEL_SUPER_ADMIN) {
            $validated['location_id'] = null;
        } else {
            $validated['location_id'] = $user->locations->first()?->id;
        }

        $supplier = Supplier::create($validated);

        if ($request->input('_from_modal')) {
            return Redirect::back()
                ->with('success', __('messages.supplier.created'))
                ->with('newSupplier', SupplierResource::make($supplier));
        }

        return Redirect::route('suppliers.index')
            ->with('success', __('messages.supplier.created'));
    }

    public function edit(Supplier $supplier): Response
    {
        return Inertia::render('Suppliers/Edit', [
            'supplier' => SupplierResource::make($supplier),
            'canEdit' => Auth::user()->can('update', $supplier),
        ]);
    }

    public function update(UpdateSupplierRequest $request, Supplier $supplier)
    {
        $this->authorize('update', $supplier);

        $supplier->update($request->validated());
        return Redirect::route('suppliers.index')
            ->with('success', __('messages.supplier.updated'));
    }

    public function destroy(Supplier $supplier): RedirectResponse
    {
        $this->authorize('delete', $supplier);

        $supplier->delete();

        return Redirect::route('suppliers.index')
            ->with('success', __('messages.supplier.deleted'));
    }

    public function restore(Supplier $supplier): RedirectResponse
    {
        $this->authorize('restore', $supplier);

        $supplier->restore();

        return Redirect::route('suppliers.index')
            ->with('success', __('messages.supplier.restored'));
    }
}

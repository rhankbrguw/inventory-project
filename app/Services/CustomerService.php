<?php

namespace App\Services;

use App\Http\Resources\CustomerResource;
use App\Http\Resources\TypeResource;
use App\Models\Customer;
use App\Models\Role;
use App\Models\Type;
use App\Models\User;
use Illuminate\Http\Request;

class CustomerService
{
    public function getIndexData(User $user, Request $request): array
    {
        $status = is_string($request->input('status')) ? trim($request->input('status')) : null;
        $typeId = trim((string) ($request->input('type_id') ?? ''));
        $typeId = $typeId === 'null' ? '' : $typeId;

        $customers = Customer::query()->withTrashed()->with(['type'])->accessibleBy($user)
            ->when($request->filled('search'), fn ($q, $s) => $q->where(fn ($sub) => $sub->where('name', 'like', "%{$s}%")->orWhere('email', 'like', "%{$s}%")->orWhere('phone', 'like', "%{$s}%")))
            ->when($status === 'active', fn ($q) => $q->whereNull('deleted_at'))
            ->when($status === 'inactive', fn ($q) => $q->whereNotNull('deleted_at'))
            ->when($typeId !== '' && $typeId !== 'all', fn ($q) => $q->whereHas('type', fn ($typeQuery) => $typeQuery
                ->whereKey($typeId)
                ->where('group', Type::GROUP_CUSTOMER)))
            ->when($request->input('sort'), fn ($q, $srt) => $this->applySort($q, $srt), fn ($q) => $q->latest('created_at'))
            ->paginate(10)
            ->withQueryString();

        return [
            'customers' => CustomerResource::collection($customers),
            'filters' => (object) $request->only(['search', 'status', 'sort', 'type_id']),
            'customerTypes' => TypeResource::collection($this->getCustomerTypes()),
        ];
    }

    private function applySort(\Illuminate\Database\Eloquent\Builder $query, string $sort): void
    {
        match ($sort) {
            'name_asc' => $query->orderBy('name', 'asc'),
            'name_desc' => $query->orderBy('name', 'desc'),
            'oldest' => $query->orderBy('created_at', 'asc'),
            default => $query->latest('created_at'),
        };
    }

    public function getCustomerTypes(): \Illuminate\Support\Collection
    {
        return Type::getForGroup(Type::GROUP_CUSTOMER);
    }

    public function createCustomer(array $validated, User $user): Customer
    {
        $validated['location_id'] = $user->level === Role::LEVEL_SUPER_ADMIN ? null : $user->locations->first()?->id;

        return Customer::create($validated);
    }

    public function updateCustomer(Customer $customer, array $attributes): bool
    {
        return $customer->update($attributes);
    }

    public function deleteCustomer(Customer $customer): bool
    {
        return (bool) $customer->delete();
    }

    public function restoreCustomer(int|string $id): bool
    {
        $customer = Customer::withTrashed()->findOrFail($id);

        return (bool) $customer->restore();
    }
}

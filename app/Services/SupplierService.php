<?php

namespace App\Services;

use App\Http\Resources\SupplierResource;
use App\Models\Role;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Http\Request;

class SupplierService
{
    public function getIndexData(User $user, Request $request): array
    {
        $suppliers = Supplier::query()->accessibleBy($user)
            ->when($request->input('search'), fn ($q, $s) => $q->where(fn ($sub) => $sub->where('name', 'like', "%{$s}%")->orWhere('contact_person', 'like', "%{$s}%")->orWhere('email', 'like', "%{$s}%")))
            ->when($request->input('status'), fn ($q, $st) => $st === 'active' ? $q->whereNull('deleted_at') : ($st === 'inactive' ? $q->whereNotNull('deleted_at') : null))
            ->when($request->input('sort'), fn ($q, $srt) => $this->applySort($q, $srt), fn ($q) => $q->orderBy('name', 'asc'))
            ->withTrashed()->paginate(10)->withQueryString();

        return [
            'suppliers' => SupplierResource::collection($suppliers),
            'filters' => (object) $request->only(['search', 'sort', 'status']),
        ];
    }

    private function applySort(\Illuminate\Database\Eloquent\Builder $query, string $sort): void
    {
        match ($sort) {
            'name_asc' => $query->orderBy('name', 'asc'),
            'name_desc' => $query->orderBy('name', 'desc'),
            default => $query->orderBy('name', 'asc'),
        };
    }

    public function createSupplier(array $validated, User $user): Supplier
    {
        $validated['location_id'] = $user->level === Role::LEVEL_SUPER_ADMIN ? null : $user->locations->first()?->id;

        return Supplier::create($validated);
    }

    public function updateSupplier(Supplier $supplier, array $attributes): bool
    {
        return $supplier->update($attributes);
    }

    public function deleteSupplier(Supplier $supplier): bool
    {
        return (bool) $supplier->delete();
    }

    public function restoreSupplier(Supplier $supplier): bool
    {
        return (bool) $supplier->restore();
    }
}

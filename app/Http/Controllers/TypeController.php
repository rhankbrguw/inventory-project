<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTypeRequest;
use App\Http\Requests\UpdateTypeRequest;
use App\Http\Resources\TypeResource;
use App\Models\Type;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class TypeController extends Controller
{
    public function index(Request $request): Response
    {
        $types = Type::query()
            ->when($request->input('search'), function ($query, $search) {
                $query
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
            })
            ->when($request->input('group'), function ($query, $group) {
                $query->where('group', $group);
            })
            ->when($request->input('status'), function ($query, $status) {
                if ($status === 'active') {
                    $query->whereNull('deleted_at');
                } elseif ($status === 'inactive') {
                    $query->whereNotNull('deleted_at');
                }
            })
            ->when($request->input('sort'), function ($query, $sort) {
                $direction = str_ends_with($sort, '_desc') ? 'desc' : 'asc';
                $column = str_replace(['_asc', '_desc'], '', $sort);
                $query->orderBy($column, $direction);
            }, function ($query) {
                $query->orderBy('group')->orderBy('name');
            })
            ->withTrashed()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Types/Index', [
            'types' => TypeResource::collection($types),
            'filters' => (object) $request->only(['search', 'group', 'sort']),
            'groups' => Type::getAvailableGroups(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Types/Create', [
            'availableGroups' => Type::getAvailableGroups(),
            'availableLevels' => Type::getAvailableLevels(),
            'allTypes' => Type::all()->groupBy('group'),
        ]);
    }

    public function store(StoreTypeRequest $request): RedirectResponse
    {
        Type::create($request->validated());

        if ($request->input('_from_modal')) {
            return Redirect::back()->with('success', 'Tipe baru berhasil ditambahkan.');
        }

        return Redirect::route('types.index')
            ->with('success', 'Tipe baru berhasil ditambahkan.');
    }

    public function edit(Type $type): Response
    {
        return Inertia::render('Types/Edit', [
            'type' => TypeResource::make($type),
            'availableGroups' => Type::getAvailableGroups(),
            'availableLevels' => Type::getAvailableLevels(),
            'allTypes' => Type::all()->groupBy('group'),
        ]);
    }

    public function update(UpdateTypeRequest $request, Type $type): RedirectResponse
    {
        $type->update($request->validated());

        return Redirect::route('types.index')
            ->with('success', 'Tipe berhasil diperbarui.');
    }

    public function destroy(Type $type): RedirectResponse
    {
        if ($type->products()->exists()) {
            return Redirect::back()->with('error', 'Tipe ini tidak dapat dinonaktifkan karena masih digunakan oleh produk.');
        }

        $type->delete();

        return Redirect::route('types.index')->with('success', 'Tipe berhasil dinonaktifkan.');
    }

    public function restore($id): RedirectResponse
    {
        $type = Type::withTrashed()->findOrFail($id);
        $type->restore();

        return Redirect::route('types.index')->with('success', 'Tipe berhasil diaktifkan.');
    }
}

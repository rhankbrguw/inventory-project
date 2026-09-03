<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTypeRequest;
use App\Http\Requests\UpdateTypeRequest;
use App\Http\Resources\TypeResource;
use App\Models\Type;
use App\Services\TypeService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class TypeController extends Controller
{
    public function __construct(protected TypeService $typeService) {}

    public function index(Request $request): Response
    {
        $viewData = $this->typeService->getIndexData($request);

        return Inertia::render('Types/Index', $viewData);
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
        $this->typeService->createType($request->validated());
        if ($request->input('_from_modal')) {
            return Redirect::back()->with('success', __('messages.type.created'));
        }

        return Redirect::route('types.index')->with('success', __('messages.type.created'));
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
        $this->typeService->updateType($type, $request->validated());

        return Redirect::route('types.index')->with('success', __('messages.type.updated'));
    }

    public function destroy(Type $type): RedirectResponse
    {
        if ($type->products()->exists()) {
            return Redirect::back()->with('error', __('messages.type.cannot_delete_in_use'));
        }
        $this->typeService->deleteType($type);

        return Redirect::route('types.index')->with('success', __('messages.type.deleted'));
    }

    public function restore(int|string $id): RedirectResponse
    {
        $this->typeService->restoreType($id);

        return Redirect::route('types.index')->with('success', __('messages.type.restored'));
    }
}

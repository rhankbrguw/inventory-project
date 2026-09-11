<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreLocationRequest;
use App\Http\Requests\UpdateLocationRequest;
use App\Models\Location;
use App\Models\Type;
use App\Services\LocationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class LocationsController extends Controller
{
    public function __construct(protected LocationService $locationService)
    {
        $this->authorizeResource(Location::class, 'location');
    }

    public function index(Request $request): Response
    {
        $viewData = $this->locationService->getIndexData(Auth::user(), $request);

        return Inertia::render('Locations/Index', $viewData);
    }

    public function create(): Response
    {
        return Inertia::render('Locations/Create', [
            'locationTypes' => Type::getForGroup(Type::GROUP_LOCATION),
        ]);
    }

    public function store(StoreLocationRequest $request): RedirectResponse
    {
        $this->locationService->createLocation($request->validated());

        return Redirect::route('locations.index')->with('success', __('messages.location.created'));
    }

    public function edit(Location $location): Response
    {
        return Inertia::render('Locations/Edit', $this->locationService->getEditData($location));
    }

    public function update(UpdateLocationRequest $request, Location $location): RedirectResponse
    {
        $validated = $request->validated();
        $assignmentsInput = $validated['assignments'] ?? [];
        $mismatchError = $this->locationService->validateAssignments($assignmentsInput);

        if ($mismatchError) {
            return Redirect::back()->withErrors(['assignments' => $mismatchError]);
        }

        $this->locationService->updateLocation($location, $validated);

        return Redirect::route('locations.index')->with('success', __('messages.location.updated'));
    }

    public function destroy(Location $location): RedirectResponse
    {
        $this->locationService->deleteLocation($location);

        return Redirect::route('locations.index')->with('success', __('messages.location.deleted'));
    }

    public function restore(Location $location): RedirectResponse
    {
        $this->authorize('restore', $location);
        $this->locationService->restoreLocation($location);

        return Redirect::route('locations.index')->with('success', __('messages.location.restored'));
    }
}

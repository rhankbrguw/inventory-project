<?php

namespace App\Http\Controllers;

use App\Http\Resources\StockMovementResource;
use App\Models\Location;
use App\Models\Role;
use App\Services\DashboardFilterService;
use App\Services\DashboardService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        private DashboardService $dashboardService,
        private DashboardFilterService $dashboardFilterService,
    ) {}

    public function __invoke(Request $request): Response|RedirectResponse
    {
        $user = Auth::user();
        $accessibleIds = $user->getAccessibleLocationIds();

        $selectedLocation = $request->input('location_id');
        if ($user->level !== Role::LEVEL_SUPER_ADMIN && ! $request->has('location_id') && ! empty($accessibleIds)) {
            $selectedLocation = (string) $accessibleIds[0];
        }

        $filterIds = $this->dashboardFilterService->resolveFilterIds($user, $selectedLocation, $accessibleIds);
        $dateConfig = $this->dashboardFilterService->parseDateRange($request);
        $dashboardData = $this->dashboardService->getDashboardPayload($filterIds, $dateConfig);

        return Inertia::render('Dashboard/Index', [
            'stats' => $dashboardData['stats'],
            'charts' => $dashboardData['charts'],
            'recentMovements' => StockMovementResource::collection($this->dashboardService->getRecentMovements($filterIds)),
            'locations' => $this->getLocationsForDropdown($user),
            'filters' => array_merge($request->only(['location_id', 'date_range', 'start_date', 'end_date']), [
                'location_id' => $selectedLocation ?? $request->input('location_id'),
                'resolved_label' => $dateConfig['label'],
            ]),
        ]);
    }

    private function getLocationsForDropdown(\App\Models\User $user): \Illuminate\Support\Collection
    {
        if ($user->level === Role::LEVEL_SUPER_ADMIN) {
            return Location::getForDropdown();
        }

        return \Illuminate\Support\Facades\Cache::remember("user_locations_dropdown_{$user->id}", 3600, function () use ($user) {
            return $user->locations()->select('locations.id', 'locations.name')->orderBy('locations.name')->get();
        });
    }
}

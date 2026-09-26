<?php

namespace App\Services;

use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class DashboardFilterService
{
    public function resolveFilterIds(\App\Models\User $user, ?string $selectedLocation, ?array $accessibleIds): ?array
    {
        if ($selectedLocation !== null && $selectedLocation !== 'all') {
            if ($user->level !== Role::LEVEL_SUPER_ADMIN && ! in_array((int) $selectedLocation, $accessibleIds ?? [], true)) {
                abort(403, __('messages.access_denied_location'));
            }

            return [$selectedLocation];
        }

        return $accessibleIds;
    }

    public function parseDateRange(Request $request): array
    {
        $range = $request->input('date_range', 'this_month');
        if ($range === 'custom' && $request->filled(['start_date', 'end_date'])) {
            $start = Carbon::parse($request->input('start_date'))->startOfDay();
            $end = Carbon::parse($request->input('end_date'))->endOfDay();

            return [
                'start' => $start,
                'end' => $end,
                'label' => $start->format('d M').' - '.$end->format('d M'),
            ];
        }

        return $this->getPredefinedRange($range);
    }

    private function getPredefinedRange(string $range): array
    {
        return match ($range) {
            'today' => [
                'start' => Carbon::today(),
                'end' => Carbon::today()->endOfDay(),
                'label' => __('messages.date.today'),
            ],
            'last_7_days' => [
                'start' => Carbon::today()->subDays(6)->startOfDay(),
                'end' => Carbon::today()->endOfDay(),
                'label' => __('messages.date.last_7_days'),
            ],
            default => [
                'start' => Carbon::now()->startOfMonth(),
                'end' => Carbon::now()->endOfMonth(),
                'label' => __('messages.date.this_month'),
            ],
        };
    }
}

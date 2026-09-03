<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\ReportService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function __construct(protected ReportService $reportService) {}

    public function index(Request $request): Response
    {
        $this->authorize('view-reports', User::class);
        $reportViewData = $this->reportService->getReportData(Auth::user(), $request);

        return Inertia::render('Reports/Index', $reportViewData);
    }
}

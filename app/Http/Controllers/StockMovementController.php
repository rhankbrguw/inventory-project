<?php

namespace App\Http\Controllers;

use App\Models\StockMovement;
use App\Services\StockMovementQueryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class StockMovementController extends Controller
{
    public function __construct(protected StockMovementQueryService $queryService) {}

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', StockMovement::class);
        $movementViewData = $this->queryService->getIndexData(Auth::user(), $request);

        return Inertia::render('StockMovements/Index', $movementViewData);
    }
}

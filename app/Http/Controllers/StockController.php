<?php

namespace App\Http\Controllers;

use App\Http\Requests\AdjustStockRequest;
use App\Http\Resources\ApiResponse;
use App\Http\Resources\InventoryResource;
use App\Http\Resources\ProductResource;
use App\Http\Resources\StockMovementResource;
use App\Models\Inventory;
use App\Models\Location;
use App\Models\Product;
use App\Services\StockAdjustmentService;
use App\Services\StockIndexQueryService;
use App\Traits\ManagesStock;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class StockController extends Controller
{
    use ManagesStock;

    public function __construct(
        protected StockIndexQueryService $queryService,
        protected StockAdjustmentService $adjustmentService
    ) {}

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Inventory::class);
        $stockViewData = $this->queryService->getIndexViewData(Auth::user(), $request);

        return Inertia::render('Stock/Index', $stockViewData);
    }

    public function show(Inventory $inventory): Response
    {
        $this->authorize('view', $inventory);
        $accessibleIds = Auth::user()->getAccessibleLocationIds();
        if ($accessibleIds && ! in_array($inventory->location_id, $accessibleIds)) {
            abort(403, __('messages.access_denied_stock'));
        }

        $inventory->load(['product.type', 'location.type']);
        $stockMovements = $this->stockService->getInventoryMovements($inventory);

        return Inertia::render('Stock/Show', [
            'inventory' => InventoryResource::make($inventory),
            'stockMovements' => StockMovementResource::collection($stockMovements),
        ]);
    }

    public function showAdjustForm(): Response
    {
        $user = Auth::user();
        $accessibleIds = $user->getAccessibleLocationIds();
        $productsQuery = Product::accessibleBy($user)->whereNull('deleted_at')->orderBy('name');
        $locationsQuery = Location::whereNull('deleted_at')->orderBy('name');

        if ($accessibleIds) {
            $productsQuery->whereHas('inventories', fn ($q) => $q->whereIn('location_id', $accessibleIds));
            $locationsQuery->whereIn('id', $accessibleIds);
        }

        return Inertia::render('Stock/Adjust', [
            'products' => ProductResource::collection($productsQuery->get()),
            'locations' => $locationsQuery->get(['id', 'name']),
            'adjustmentReasons' => [
                ['value' => 'Stock Opname', 'label' => __('ui.physical_stock_adjustment')],
                ['value' => 'Rusak', 'label' => __('ui.damaged_goods')],
                ['value' => 'Retur', 'label' => __('ui.returned_goods')],
            ],
        ]);
    }

    public function adjust(AdjustStockRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $this->authorize('adjust', [Inventory::class, $validated['location_id']]);
        $user = $request->user();

        $accessibleIds = $user->getAccessibleLocationIds();
        if ($accessibleIds && ! in_array($validated['location_id'], $accessibleIds)) {
            abort(403, __('messages.access_denied_location'));
        }

        try {
            $this->adjustmentService->adjust($validated, $user);
        } catch (\Exception $e) {
            return Redirect::back()->with('error', __('messages.stock.adjustment_failed', ['error' => $e->getMessage()]));
        }

        return Redirect::route('stock.index')->with('success', __('messages.stock.adjusted'));
    }

    public function getQuantity(Request $request): JsonResponse
    {
        $request->validate([
            'product_id' => ['required', 'exists:products,id'],
            'location_id' => ['required', 'exists:locations,id'],
        ]);

        $quantity = $this->stockService->getInventoryQuantity((int) $request->product_id, (int) $request->location_id);

        return ApiResponse::success(['quantity' => $quantity]);
    }
}

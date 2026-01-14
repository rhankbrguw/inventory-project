<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Http\Resources\StockMovementResource;
use App\Models\Location;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\Sell;
use App\Models\Role;
use App\Models\User;
use App\Models\StockMovement;
use App\Models\StockTransfer;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class StockMovementController extends Controller
{
    public function index(Request $request): Response
    {
        $user = Auth::user();
        $roleCode = $user->roles->first()?->code;

        if ($user->level > Role::THRESHOLD_STAFF || $roleCode === Role::CODE_CASHIER) {
            abort(403, 'Anda tidak memiliki akses ke halaman ini.');
        }

        $accessibleLocationIds = $user->getAccessibleLocationIds();

        $stockMovements = StockMovement::with([
            'product',
            'location',
            'reference' => function (MorphTo $morphTo) {
                $morphTo->morphWith([
                    Purchase::class => ['supplier', 'fromLocation'],
                    Sell::class => ['customer', 'targetLocation'],
                    StockTransfer::class => ['fromLocation', 'toLocation'],
                    User::class => [],
                ]);
            }
        ])
            ->when($accessibleLocationIds, function ($query) use ($accessibleLocationIds) {
                $query->whereIn('location_id', $accessibleLocationIds);
            })
            ->when($request->input('search'), function ($query, $search) {
                $query->whereHas('product', function ($q) use ($search) {
                    $q
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('sku', 'like', "%{$search}%");
                });
            })
            ->when($request->input('location_id'), function ($query, $locationId) {
                if ($locationId && $locationId !== 'all') {
                    $query->where('location_id', $locationId);
                }
            })
            ->when($request->input('product_id'), function ($query, $productId) {
                if ($productId) {
                    $query->where('product_id', $productId);
                }
            })
            ->when($request->input('type'), function ($query, $type) {
                if ($type && $type !== 'all') {
                    $query->where('type', $type);
                }
            })
            ->latest('created_at')
            ->paginate(20)
            ->withQueryString();

        $locationsQuery = Location::orderBy('name');
        if ($accessibleLocationIds) {
            $locationsQuery->whereIn('id', $accessibleLocationIds);
        }

        $productsQuery = Product::orderBy('name');
        if ($user->level !== Role::LEVEL_SUPER_ADMIN) {
            $locationId = $user->locations->first()?->id;
            if ($locationId) {
                $productsQuery->with(['inventories' => function ($q) use ($locationId) {
                    $q->where('location_id', $locationId);
                }]);
            }
        }

        return Inertia::render('StockMovements/Index', [
            'stockMovements' => StockMovementResource::collection($stockMovements),
            'locations' => $locationsQuery->get(['id', 'name']),
            'products' => ProductResource::collection($productsQuery->get()),
            'movementTypes' => StockMovement::getMovementTypes(),
            'filters' => (object) $request->only(['search', 'location_id', 'product_id', 'type']),
        ]);
    }
}

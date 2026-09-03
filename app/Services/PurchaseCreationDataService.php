<?php

namespace App\Services;

use App\Http\Resources\Transaction\PurchaseCartItemResource;
use App\Models\Location;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\Supplier;
use App\Models\Type;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;

class PurchaseCreationDataService
{
    public function getCreateViewData(User $user, Request $request): array
    {
        $accessibleIds = $user->getAccessibleLocationIds();
        $fromLocationId = $request->input('from_location_id');
        $isInternalMode = ! empty($fromLocationId);

        $locationsWithPermissions = $this->getAccessibleLocations($user, $accessibleIds);
        $cartItems = $user->purchaseCartItems()->with(['product.defaultSupplier', 'supplier'])->get();
        $products = $this->getProductsForPurchase($user, $accessibleIds, $fromLocationId ? (int) $fromLocationId : null, $request, $isInternalMode);

        return [
            'locations' => $locationsWithPermissions,
            'suppliers' => Supplier::accessibleBy($user)->orderBy('name')->get(['id', 'name']),
            'warehouses' => Location::getForDropdown(),
            'products' => $products,
            'paymentMethods' => Type::getForGroup(Type::GROUP_PAYMENT),
            'productTypes' => Type::getForGroup(Type::GROUP_PRODUCT),
            'cart' => PurchaseCartItemResource::collection($cartItems),
            'filters' => (object) $request->only(['search', 'type_id', 'supplier_id', 'from_location_id']),
        ];
    }

    private function getAccessibleLocations(User $user, ?array $accessibleIds): \Illuminate\Support\Collection
    {
        $query = Location::orderBy('name')->with('type');
        if ($accessibleIds) {
            $query->whereIn('id', $accessibleIds);
        }

        return $query->get()
            ->filter(fn (Location $loc) => $user->can('createAtLocation', [Purchase::class, $loc->id]))
            ->values()
            ->map(fn (Location $loc) => ['id' => $loc->id, 'name' => $loc->name, 'role_at_location' => $user->getRoleCodeAtLocation($loc->id)]);
    }

    public function getProductsForPurchase(User $user, ?array $accessibleIds, ?int $fromLocationId, Request $request, bool $isInternalMode): LengthAwarePaginator
    {
        $query = Product::accessibleBy($user)->whereNull('deleted_at')->with('defaultSupplier:id,name');

        if ($isInternalMode && $fromLocationId) {
            $query->with(['inventories' => fn ($q) => $q->where('location_id', $fromLocationId)])
                ->whereHas('inventories', fn ($q) => $q->where('location_id', $fromLocationId)->where('quantity', '>', 0));
        } elseif (! $isInternalMode) {
            $search = $request->input('search');
            $typeId = $request->input('type_id');
            $supplierId = $request->input('supplier_id');

            $query->when($accessibleIds, fn ($q) => $q->whereHas('inventories', fn ($qi) => $qi->whereIn('location_id', $accessibleIds)))
                ->when($search, fn ($q, $s) => $q->where('name', 'like', "%{$s}%")->orWhere('sku', 'like', "%{$s}%"))
                ->when($typeId && $typeId !== 'all', fn ($q) => $q->where('type_id', $typeId))
                ->when($supplierId && $supplierId !== 'all', fn ($q) => $supplierId === 'null' ? $q->whereNull('default_supplier_id') : $q->where('default_supplier_id', $supplierId));
        } else {
            $query->whereRaw('1 = 0');
        }

        $paginated = $query->orderBy('name')->paginate(12)->withQueryString();
        if ($isInternalMode) {
            $paginated->getCollection()->transform(fn (Product $prod) => $this->formatInternalProduct($prod));
        }

        return $paginated;
    }

    private function formatInternalProduct(Product $product): Product
    {
        $inventory = $product->inventories->first();
        $product->stock_quantity = $inventory ? $inventory->quantity : 0;
        $sellingPrice = $product->price;
        if ($inventory && ! is_null($inventory->selling_price) && $inventory->selling_price > 0) {
            $sellingPrice = $inventory->selling_price;
        }
        $product->price = $sellingPrice;

        return $product;
    }
}

<?php

namespace App\Services;

use App\Http\Resources\Transaction\SellCartItemResource;
use App\Models\Customer;
use App\Models\Location;
use App\Models\Product;
use App\Models\Role;
use App\Models\Sell;
use App\Models\Type;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;

class SellCheckoutDataService
{
    public function getCreateViewData(User $user, Request $request, SellCheckoutService $checkoutService): array
    {
        $accessibleLocationIds = $user->getAccessibleLocationIds();
        $locations = $this->getAccessibleLocations($user, $accessibleLocationIds);
        $locationId = $this->resolveSelectedLocation($request->input('location_id'), $accessibleLocationIds, $locations);

        return [
            'locations' => $locations,
            'customers' => Customer::accessibleBy($user)->with('type')->orderBy('name')->get(['id', 'name', 'type_id']),
            'branches' => Location::getForDropdown(),
            'allProducts' => $this->getProductsForCheckout($user, $locationId, $request->input('search'), $request->input('type_id')),
            'paymentMethods' => Type::getForGroup(Type::GROUP_PAYMENT),
            'productTypes' => Type::getForGroup(Type::GROUP_PRODUCT),
            'customerTypes' => Type::getForGroup(Type::GROUP_CUSTOMER),
            'salesChannels' => Type::getForGroup(Type::GROUP_SALES_CHANNEL),
            'cart' => SellCartItemResource::collection($checkoutService->getCartItems($user)),
            'filters' => (object) $request->only(['location_id', 'search', 'type_id']),
        ];
    }

    private function getAccessibleLocations(User $user, ?array $accessibleIds): \Illuminate\Support\Collection
    {
        $query = Location::orderBy('name')->with('type');
        if ($accessibleIds) {
            $query->whereIn('id', $accessibleIds);
        }

        return $query->get()
            ->filter(fn (Location $loc) => $user->can('createAtLocation', [Sell::class, $loc->id]))
            ->values()
            ->map(fn (Location $loc) => ['id' => $loc->id, 'name' => $loc->name, 'role_at_location' => $user->getRoleCodeAtLocation($loc->id)]);
    }

    private function resolveSelectedLocation(?int $locationId, ?array $accessibleIds, \Illuminate\Support\Collection $locations): ?int
    {
        if ($accessibleIds && $locationId && ! in_array($locationId, $accessibleIds)) {
            $locationId = null;
        }
        if (! $locationId && $locations->isNotEmpty()) {
            return (int) $locations->first()['id'];
        }

        return $locationId ? (int) $locationId : null;
    }

    public function getProductsForCheckout(User $user, ?int $locationId, ?string $search, ?int $typeId): LengthAwarePaginator
    {
        if (! $locationId) {
            return new LengthAwarePaginator([], 0, 12);
        }

        $productsQuery = Product::accessibleBy($user)
            ->whereNull('deleted_at')
            ->with([
                'defaultSupplier:id,name',
                'prices',
                'inventories' => fn ($q) => $q->where('location_id', $locationId),
            ])
            ->whereHas('inventories', fn ($iq) => $iq->where('location_id', $locationId)->where('quantity', '>', 0))
            ->when($search, fn ($q, $s) => $q->where('name', 'like', "%{$s}%")->orWhere('sku', 'like', "%{$s}%"))
            ->when($typeId && $typeId !== 'all', fn ($q) => $q->where('type_id', $typeId))
            ->orderBy('name');

        $cashChannelId = Type::getForGroup(Type::GROUP_SALES_CHANNEL)->firstWhere('code', 'CASH')?->id;

        return $productsQuery->paginate(12)->through(fn ($prod) => $this->formatProductItem($prod, $user, $locationId, $cashChannelId));
    }

    private function formatProductItem(Product $product, User $user, ?int $locationId, ?int $cashChannelId): array
    {
        $effectivePrice = $product->price;
        $inventory = $locationId ? $product->inventories->where('location_id', $locationId)->first() : null;

        if ($user && $user->level !== Role::LEVEL_SUPER_ADMIN && $inventory?->selling_price > 0) {
            $effectivePrice = $inventory->selling_price;
        }

        $channelPrices = $product->prices->pluck('price', 'type_id')->toArray();
        if ($cashChannelId) {
            $channelPrices[$cashChannelId] = $effectivePrice;
        }

        if ($user && $user->level !== Role::LEVEL_SUPER_ADMIN && $inventory?->channel_prices_override) {
            foreach ($inventory->channel_prices_override as $channelId => $price) {
                if ($price !== null && $price !== '') {
                    $channelPrices[$channelId] = (float) $price;
                }
            }
        }

        return array_merge($product->toArray(), [
            'price' => $effectivePrice,
            'channel_prices' => $channelPrices,
        ]);
    }
}

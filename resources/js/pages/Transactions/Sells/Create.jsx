import { useState, useMemo, useEffect } from 'react';
import ContentPageLayout from '@/components/ContentPageLayout';
import { useSellCart } from '@/hooks/useSellCart';
import SellProductGrid from './Partials/SellProductGrid';
import SellCart from './Partials/SellCart';
import SellCheckoutDialog from './Partials/SellCheckoutDialog';
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { useIndexPageFilters } from '@/hooks/useIndexPageFilters';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { formatNumber } from '@/lib/utils';

export default function Create({
    auth,
    locations,
    customers,
    branches,
    allProducts,
    paymentMethods,
    productTypes = [],
    salesChannels,
    customerTypes = [],
    cart: { data: initialCart = [] },
    filters,
}) {
    const { params, setFilter } = useIndexPageFilters(
        'transactions.sells.create',
        filters
    );

    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [cartOpen, setCartOpen] = useState(false);
    const [selectedCustomerId, setSelectedCustomerId] = useState(null);
    const [selectedBranchId, setSelectedBranchId] = useState(null);
    const [pendingLocationId, setPendingLocationId] = useState(null);

    const selectedLocationId = useMemo(
        () => params.location_id || '',
        [params.location_id]
    );

    const [selectedChannelId, setSelectedChannelId] = useState(
        salesChannels.length > 0 ? salesChannels[0].id.toString() : ''
    );

    const {
        cart,
        selectedProductIds,
        processingItem,
        addItem,
        removeItem,
        updateCartItem,
        clearCart,
        totalCartItems,
        totalCartPrice,
        getItemQuantity,
    } = useSellCart(initialCart, selectedLocationId);

    useEffect(() => {
        if (
            !selectedLocationId &&
            locations.length > 0 &&
            !filters.location_id
        ) {
            setFilter('location_id', locations[0].id.toString());
        }
    }, [selectedLocationId, locations, filters.location_id]);

    const getProductPrice = (product) => {
        if (!selectedChannelId) return product.price;
        return product.channel_prices?.[selectedChannelId] || product.price;
    };

    const handleChannelChange = (channelId) => {
        setSelectedChannelId(channelId);
    };

    const handleLocationChange = (locationId) => {
        if (locationId === selectedLocationId) return;

        if (cart.length > 0) {
            setPendingLocationId(locationId);
        } else {
            setFilter('location_id', locationId);
        }
    };

    const confirmLocationChange = () => {
        clearCart(() => {
            setFilter('search', '');
            setFilter('type_id', 'all');
            setFilter('location_id', pendingLocationId);
            setPendingLocationId(null);
        });
    };

    const handleCustomerChange = (customerId) => {
        setSelectedCustomerId(customerId);
    };

    const handleBranchChange = (branchId) => {
        setSelectedBranchId(branchId);
    };

    const cartProps = {
        cart,
        customers,
        branches,
        customerTypes,
        selectedCustomerId,
        selectedBranchId,
        onCustomerChange: handleCustomerChange,
        onBranchChange: handleBranchChange,
        removeItem,
        updateItem: updateCartItem,
        clearCart,
        processingItem,
        totalCartItems,
        totalCartPrice,
        onCheckout: () => {
            if (!selectedLocationId) {
                return;
            }
            setIsCheckoutOpen(true);
            setCartOpen(false);
        },
        locationId: selectedLocationId,
        getItemQuantity,
        canCheckout: !!selectedLocationId,
        getProductPrice: getProductPrice,
    };

    return (
        <ContentPageLayout
            user={auth.user}
            title="Buat Penjualan"
            backRoute="transactions.index"
            isFullWidth={true}
        >
            <div className="flex flex-1 gap-4 min-h-[calc(100vh-13rem)] max-h-[calc(100vh-13rem)]">
                <div className="flex-1 lg:flex-[3] flex flex-col overflow-hidden rounded-lg border bg-card">
                    <SellProductGrid
                        locations={locations}
                        onLocationChange={handleLocationChange}
                        products={allProducts.data}
                        productTypes={productTypes}
                        salesChannels={salesChannels}
                        selectedChannelId={selectedChannelId}
                        onChannelChange={handleChannelChange}
                        getProductPrice={getProductPrice}
                        params={params}
                        setFilter={setFilter}
                        onProductClick={(product) => {
                            const price = getProductPrice(product);
                            addItem(product, price, selectedChannelId);
                        }}
                        selectedProductIds={selectedProductIds}
                        processingItem={processingItem}
                        paginationLinks={allProducts.links}
                    />
                </div>

                <div className="hidden lg:flex flex-[2] flex-col overflow-hidden rounded-lg border bg-card">
                    <SellCart {...cartProps} />
                </div>
            </div>

            <Sheet open={cartOpen} onOpenChange={setCartOpen}>
                <SheetTrigger asChild>
                    <Button
                        className="lg:hidden fixed bottom-4 right-4 h-14 w-14 rounded-full shadow-lg z-50"
                        size="icon"
                    >
                        <ShoppingCart className="h-6 w-6" />
                        {totalCartItems > 0 && (
                            <span className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-destructive text-destructive-foreground text-xs font-bold flex items-center justify-center">
                                {formatNumber(totalCartItems)}
                            </span>
                        )}
                    </Button>
                </SheetTrigger>
                <SheetContent
                    side="right"
                    className="w-full sm:max-w-md p-0 flex flex-col"
                >
                    <SellCart {...cartProps} />
                </SheetContent>
            </Sheet>

            <SellCheckoutDialog
                isOpen={isCheckoutOpen}
                onOpenChange={setIsCheckoutOpen}
                cartItems={cart}
                totalPrice={totalCartPrice}
                locationId={selectedLocationId}
                customerId={selectedCustomerId}
                targetLocationId={selectedBranchId}
                salesChannelId={selectedChannelId}
                paymentMethods={paymentMethods}
            />

            <DeleteConfirmationDialog
                open={!!pendingLocationId}
                onOpenChange={() => setPendingLocationId(null)}
                onConfirm={confirmLocationChange}
                title="Kosongkan Keranjang?"
                description="Mengganti lokasi akan mengosongkan keranjang Anda saat ini. Lanjutkan?"
                confirmText="Lanjutkan"
            />
        </ContentPageLayout>
    );
}

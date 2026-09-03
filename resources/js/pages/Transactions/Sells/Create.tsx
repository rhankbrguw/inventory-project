import { useState, useMemo, useEffect } from 'react';
import ContentPageLayout from '@/components/ContentPageLayout';
import { useSellCart } from '@/hooks/useSellCart';
import SellProductGrid from './Partials/SellProductGrid';
import SellCart from './Partials/SellCart';
import SellCheckoutDialog from './Partials/SellCheckoutDialog';
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';
import { useIndexPageFilters } from '@/hooks/useIndexPageFilters';
import SellCartSheet from './Partials/SellCartSheet';
import useTranslation from '@/hooks/useTranslation';

export default function Create({ auth, locations, customers, branches, allProducts, paymentMethods, productTypes = [], salesChannels, customerTypes = [], cart: { data: initialCart = [] }, filters }) {
    const { params, setFilter } = useIndexPageFilters('transactions.sells.create', filters);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [cartOpen, setCartOpen] = useState(false);
    const [selectedCustomerId, setSelectedCustomerId] = useState(null);
    const [selectedBranchId, setSelectedBranchId] = useState(null);
    const [pendingLocationId, setPendingLocationId] = useState(null);
    const { t } = useTranslation();

    const selectedLocationId = useMemo(() => params.location_id || '', [params.location_id]);
    const [selectedChannelId, setSelectedChannelId] = useState(salesChannels.length > 0 ? salesChannels[0].id.toString() : '');

    const { cart, selectedProductIds, processingItem, addItem, removeItem, updateCartItem, clearCart, totalCartItems, totalCartPrice, getItemQuantity } = useSellCart(initialCart, selectedLocationId);

    useEffect(() => {
        if (!selectedLocationId && locations.length > 0 && !filters.location_id) {
            setFilter('location_id', locations[0].id.toString());
        }
    }, [selectedLocationId, locations, filters.location_id]);

    const getProductPrice = (p) => (!selectedChannelId ? Number(p.price) : (p.channel_prices?.[selectedChannelId] != null ? Number(p.channel_prices[selectedChannelId]) : Number(p.price)));
    const handleLocationChange = (locId) => (cart.length > 0 ? setPendingLocationId(locId) : setFilter('location_id', locId));
    const confirmLocationChange = () => clearCart(() => { setFilter('search', ''); setFilter('type_id', 'all'); setFilter('location_id', pendingLocationId); setPendingLocationId(null); });

    const cartProps = {
        cart, customers, branches, customerTypes, selectedCustomerId, selectedBranchId,
        onCustomerChange: setSelectedCustomerId, onBranchChange: setSelectedBranchId,
        removeItem, updateItem: updateCartItem, clearCart, processingItem, totalCartItems, totalCartPrice,
        onCheckout: () => { if (!selectedLocationId) return; setIsCheckoutOpen(true); setCartOpen(false); },
        locationId: selectedLocationId, getItemQuantity, canCheckout: !!selectedLocationId, getProductPrice,
    };

    return (
        <ContentPageLayout user={auth.user} title={t('ui.create_sell')} backRoute="transactions.index" isFullWidth={true}>
            <div className="flex flex-1 gap-4 min-h-[calc(100vh-13rem)] max-h-[calc(100vh-13rem)]">
                <div className="flex-1 lg:flex-[3] flex flex-col overflow-hidden rounded-lg border bg-card">
                    <SellProductGrid
                        locations={locations} onLocationChange={handleLocationChange} products={allProducts.data}
                        productTypes={productTypes} salesChannels={salesChannels} selectedChannelId={selectedChannelId}
                        onChannelChange={setSelectedChannelId} getProductPrice={getProductPrice} params={params} setFilter={setFilter}
                        onProductClick={(p) => addItem(p, getProductPrice(p), selectedChannelId)}
                        selectedProductIds={selectedProductIds} processingItem={processingItem} paginationLinks={allProducts.links}
                    />
                </div>
                <div className="hidden lg:flex flex-[2] flex-col overflow-hidden rounded-lg border bg-card"><SellCart {...cartProps} /></div>
            </div>
            <SellCartSheet isOpen={cartOpen} onOpenChange={setCartOpen} totalCartItems={totalCartItems} cartProps={cartProps} />
            <SellCheckoutDialog isOpen={isCheckoutOpen} onOpenChange={setIsCheckoutOpen} cartItems={cart} totalPrice={totalCartPrice} locationId={selectedLocationId} customerId={selectedCustomerId} targetLocationId={selectedBranchId} salesChannelId={selectedChannelId} paymentMethods={paymentMethods} />
            <DeleteConfirmationDialog open={!!pendingLocationId} onOpenChange={() => setPendingLocationId(null)} onConfirm={confirmLocationChange} title={t('ui.clear_cart')} description={t('ui.clear_cart_desc')} confirmText={t('ui.continue')} />
        </ContentPageLayout>
    );
}

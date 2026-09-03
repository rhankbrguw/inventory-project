import ContentPageLayout from '@/components/ContentPageLayout';
import PurchaseProductGrid from './Partials/PurchaseProductGrid';
import PurchaseCart from './Partials/PurchaseCart';
import PurchaseCheckoutDialog from './Partials/PurchaseCheckoutDialog';
import PurchaseCartSheet from './Partials/PurchaseCartSheet';
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';
import useTranslation from '@/hooks/useTranslation';
import usePurchaseCreate from './hooks/usePurchaseCreate';

export default function Create({
    auth,
    locations,
    suppliers,
    products,
    paymentMethods,
    warehouses,
    productTypes = [],
    cart: { data: initialCart = [] },
    filters,
}) {
    const { t } = useTranslation();
    const canPurchaseAnywhere = locations.length > 0;

    const {
        isCheckoutModalOpen,
        setIsCheckoutModalOpen,
        cartOpen,
        setCartOpen,
        selectedGroup,
        setSelectedGroup,
        selectedSourceType,
        selectedSourceId,
        pendingSource,
        setPendingSource,
        purchaseCartProps,
        params,
        setFilter,
        dynamicTotal,
        handleAddItem,
        handleSourceChange,
        handleClearCart,
        handleOpenCheckout,
    } = usePurchaseCreate(initialCart, filters);

    const {
        cartGroups,
        selectedProductIds,
        processingItem,
        processingGroup,
        removeItem,
        removeSupplierGroup,
        updateCartItem,
        getItemQuantity,
        getItemCost,
        totalCartItems,
    } = purchaseCartProps;

    const cartProps = {
        cartGroups,
        processingGroup,
        removeItem,
        removeSupplierGroup,
        updateItem: updateCartItem,
        getItemQuantity,
        getItemCost,
        onCheckout: handleOpenCheckout,
        processingItem,
        totalCartItems,
        suppliers,
        warehouses,
        locations,
        canCheckout: canPurchaseAnywhere,
        onInternalSourceChange: handleSourceChange,
        selectedSourceId,
        selectedSourceType,
        dynamicTotal,
        params,
        setFilter,
    };

    return (
        <ContentPageLayout
            user={auth.user}
            title={t('ui.create_purchase')}
            backRoute="transactions.index"
            isFullWidth={true}
        >
            <div className="flex flex-1 gap-4 min-h-[calc(100vh-13rem)] max-h-[calc(100vh-13rem)]">
                <div className="flex-1 lg:flex-[3] flex flex-col overflow-hidden rounded-lg border bg-card">
                    <PurchaseProductGrid
                        products={products.data}
                        productTypes={productTypes}
                        params={params}
                        setFilter={setFilter}
                        onProductClick={handleAddItem}
                        selectedProductIds={selectedProductIds}
                        processingItem={processingItem}
                        paginationLinks={products.links}
                        canPurchase={canPurchaseAnywhere}
                        selectedSourceType={selectedSourceType}
                        selectedSourceId={selectedSourceId}
                    />
                </div>

                <div className="hidden lg:flex flex-[2] flex-col overflow-hidden rounded-lg border bg-card">
                    <PurchaseCart {...cartProps} />
                </div>
            </div>

            <PurchaseCartSheet
                cartOpen={cartOpen}
                setCartOpen={setCartOpen}
                totalCartItems={totalCartItems}
                cartProps={cartProps}
            />

            <PurchaseCheckoutDialog
                isOpen={isCheckoutModalOpen}
                onOpenChange={setIsCheckoutModalOpen}
                selectedGroup={selectedGroup}
                selectedSourceType={selectedSourceType}
                selectedSourceId={selectedSourceId}
                locations={locations}
                suppliers={suppliers}
                paymentMethods={paymentMethods}
                onClose={() => {
                    setIsCheckoutModalOpen(false);
                    setSelectedGroup(null);
                }}
            />

            <DeleteConfirmationDialog
                open={!!pendingSource}
                onOpenChange={() => setPendingSource(null)}
                onConfirm={handleClearCart}
                title={t('ui.change_source')}
                description={t('ui.change_source_desc')}
                confirmText={t('ui.change_and_clear')}
            />
        </ContentPageLayout>
    );
}

import { useState, useMemo } from 'react';
import { router } from '@inertiajs/react';
import ContentPageLayout from '@/components/ContentPageLayout';
import PurchaseDetailsManager from './Partials/PurchaseDetailsManager';
import PurchaseProductGrid from './Partials/PurchaseProductGrid';
import PurchaseCart from './Partials/PurchaseCart';
import usePurchaseCart from '@/hooks/usePurchaseCart';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useIndexPageFilters } from '@/hooks/useIndexPageFilters';
import { formatNumber, formatCurrency } from '@/lib/utils';
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';

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
    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
    const [cartOpen, setCartOpen] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [selectedSourceType, setSelectedSourceType] = useState('supplier');
    const [selectedSourceId, setSelectedSourceId] = useState(null);
    const [pendingSource, setPendingSource] = useState(null);

    const canPurchaseAnywhere = locations.length > 0;

    const {
        cartGroups,
        selectedProductIds,
        processingItem,
        processingGroup,
        addItem,
        removeItem,
        removeSupplierGroup,
        updateCartItem,
        getItemQuantity,
        getItemCost,
        totalCartItems,
        clearCart,
    } = usePurchaseCart(initialCart);

    const { params, setFilter } = useIndexPageFilters(
        'transactions.purchases.create',
        filters
    );

    const dynamicTotal = useMemo(() => {
        return Object.values(cartGroups).reduce((acc, group) => {
            return (
                acc +
                group.items.reduce((sum, item) => {
                    const qty = parseFloat(getItemQuantity(item)) || 0;
                    const cost = parseFloat(getItemCost(item)) || 0;
                    return sum + qty * cost;
                }, 0)
            );
        }, 0);
    }, [cartGroups, getItemQuantity, getItemCost]);

    const handleAddItem = (product) => {
        let targetSupplierId = product.default_supplier_id;
        let initialCost = 0;

        if (selectedSourceType === 'internal') {
            targetSupplierId = null;
            initialCost = product.price || 0;
        } else if (
            selectedSourceType === 'supplier' &&
            selectedSourceId &&
            selectedSourceId !== 'all' &&
            selectedSourceId !== 'null'
        ) {
            targetSupplierId = selectedSourceId;
        }
        addItem(product, targetSupplierId, initialCost);
    };

    const handleSourceChange = (id, type) => {
        if (totalCartItems > 0) {
            if (type !== selectedSourceType) {
                setPendingSource({ id, type });
                return;
            }
        }

        setSelectedSourceId(id);
        setSelectedSourceType(type);

        if (type === 'internal') {
            setFilter('supplier_id', null);
            setFilter('from_location_id', id);
        } else {
            setFilter('from_location_id', null);
            setFilter('supplier_id', id === 'all' ? 'all' : id);
        }
    };

    const handleClearCart = () => {
        router.delete(route('purchase.cart.destroy.all'), {
            preserveScroll: true,
            onSuccess: () => {
                clearCart(() => {
                    setSelectedSourceId(pendingSource.id);
                    setSelectedSourceType(pendingSource.type);
                    setPendingSource(null);

                    if (pendingSource.type === 'internal') {
                        setFilter('supplier_id', null);
                        setFilter('from_location_id', pendingSource.id);
                    } else {
                        setFilter('from_location_id', null);
                        setFilter('supplier_id', 'all');
                    }
                });
            },
        });
    };

    const handleOpenCheckout = (groupData) => {
        setSelectedGroup(groupData);
        setIsCheckoutModalOpen(true);
        setCartOpen(false);
    };

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
            title="Buat Pembelian"
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
                    <PurchaseCart
                        {...cartProps}
                        onClose={() => setCartOpen(false)}
                    />
                </SheetContent>
            </Sheet>

            <Dialog
                open={isCheckoutModalOpen}
                onOpenChange={setIsCheckoutModalOpen}
            >
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Konfirmasi Pembelian</DialogTitle>
                        <DialogDescription>
                            Selesaikan transaksi dengan total{' '}
                            <span className="font-bold text-primary">
                                {formatCurrency(
                                    selectedGroup?.items.reduce(
                                        (sum, item) =>
                                            sum +
                                            item.quantity * item.cost_per_unit,
                                        0
                                    ) || 0
                                )}
                            </span>
                        </DialogDescription>
                    </DialogHeader>

                    <PurchaseDetailsManager
                        supplierId={selectedGroup?.supplier_id}
                        fromLocationId={
                            selectedSourceType === 'internal'
                                ? selectedSourceId
                                : null
                        }
                        locations={locations}
                        suppliers={suppliers}
                        paymentMethods={paymentMethods}
                        cartItems={selectedGroup?.items || []}
                        onClose={() => {
                            setIsCheckoutModalOpen(false);
                            setSelectedGroup(null);
                        }}
                    />
                </DialogContent>
            </Dialog>

            <DeleteConfirmationDialog
                open={!!pendingSource}
                onOpenChange={() => setPendingSource(null)}
                onConfirm={handleClearCart}
                title="Ganti Sumber?"
                description="Pindah dari Supplier ke Internal (atau sebaliknya) harus mengosongkan keranjang. Lanjutkan?"
                confirmText="Ganti & Kosongkan"
            />
        </ContentPageLayout>
    );
}

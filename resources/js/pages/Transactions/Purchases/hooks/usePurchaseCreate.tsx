import { useState, useMemo } from 'react';
import { router } from '@inertiajs/react';
import usePurchaseCart from '@/hooks/usePurchaseCart';
import { useIndexPageFilters } from '@/hooks/useIndexPageFilters';

export default function usePurchaseCreate(initialCart, filters) {
    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
    const [cartOpen, setCartOpen] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [selectedSourceType, setSelectedSourceType] = useState('supplier');
    const [selectedSourceId, setSelectedSourceId] = useState(null);
    const [pendingSource, setPendingSource] = useState(null);

    const purchaseCartProps = usePurchaseCart(initialCart);
    const {
        cartGroups,
        addItem,
        getItemQuantity,
        getItemCost,
        totalCartItems,
        clearCart,
    } = purchaseCartProps;

    const { params, setFilter } = useIndexPageFilters(
        'transactions.purchases.create',
        filters
    );

    const cleanNum = (str) => typeof str !== 'string' ? String(str) : str.replace(/\./g, '').replace(/,/g, '.');

    const dynamicTotal = useMemo(() => {
        return Object.values(cartGroups as Record<string, any>).reduce((acc: number, group: any) => {
            return (
                acc +
                (group?.items ?? []).reduce((sum: number, item: any) => {
                    const qty = parseFloat(cleanNum(getItemQuantity(item))) || 0;
                    const cost = parseFloat(cleanNum(getItemCost(item))) || 0;
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

    return {
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
    };
}

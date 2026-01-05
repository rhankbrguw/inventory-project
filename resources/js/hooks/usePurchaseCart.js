import { useState, useMemo, useCallback, useRef } from 'react';
import { router } from '@inertiajs/react';
import { formatNumber } from '@/lib/utils';

const cleanNumberString = (numStr) => {
    if (typeof numStr !== 'string') {
        return String(numStr);
    }
    return numStr.replace(/\./g, '').replace(/,/g, '.');
};

export default function usePurchaseCart(initialCart = []) {
    const [cart, setCart] = useState(initialCart);
    const [processingItem, setProcessingItem] = useState(null);
    const [processingGroup, setProcessingGroup] = useState(false);
    const [selectedSuppliers, setSelectedSuppliers] = useState({});
    const [localQuantities, setLocalQuantities] = useState({});
    const [localCosts, setLocalCosts] = useState({});
    const updateTimeoutRef = useRef({});

    useMemo(() => {
        setCart(initialCart);
    }, [initialCart]);

    const effectiveCart = useMemo(() => {
        return cart.map((item) => {
            const localQty = localQuantities[item.id];
            const localCost = localCosts[item.id];

            return {
                ...item,
                quantity: localQty !== undefined ? localQty : item.quantity,
                cost_per_unit:
                    localCost !== undefined ? localCost : item.cost_per_unit,
            };
        });
    }, [cart, localQuantities, localCosts]);

    const cartGroups = useMemo(() => {
        return effectiveCart.reduce((acc, item) => {
            const supplierName = item.supplier?.name || 'Supplier Umum';
            if (!acc[supplierName]) {
                acc[supplierName] = {
                    supplier_id: item.supplier?.id || null,
                    items: [],
                };
            }
            acc[supplierName].items.push(item);
            return acc;
        }, {});
    }, [effectiveCart]);

    const selectedProductIds = useMemo(
        () => effectiveCart.map((item) => item.product.id),
        [effectiveCart]
    );

    const removeItem = useCallback(
        (cartItemId) => {
            if (processingItem === cartItemId) return;
            setProcessingItem(cartItemId);
            router.delete(route('purchase.cart.destroy.item', cartItemId), {
                preserveScroll: true,
                onFinish: () => setProcessingItem(null),
                onError: () => {},
            });
        },
        [processingItem]
    );

    const addItem = useCallback(
        (product) => {
            if (processingItem === product.id) return;

            const existingItem = cart.find(
                (item) => item.product.id === product.id
            );

            setProcessingItem(product.id);

            if (existingItem) {
                const newQuantity =
                    parseFloat(String(existingItem.quantity)) + 1;
                router.patch(
                    route('purchase.cart.update', {
                        cartItem: existingItem.id,
                    }),
                    { quantity: newQuantity },
                    {
                        preserveScroll: true,
                        onFinish: () => setProcessingItem(null),
                        onError: () => {},
                    }
                );
            } else {
                router.post(
                    route('purchase.cart.store'),
                    {
                        product_id: product.id,
                        supplier_id: product.default_supplier_id,
                        quantity: 1,
                        cost_per_unit: 0,
                    },
                    {
                        preserveScroll: true,
                        onFinish: () => setProcessingItem(null),
                        onError: () => {},
                    }
                );
            }
        },
        [cart, processingItem]
    );

    const removeSupplierGroup = useCallback(
        (supplierId) => {
            if (processingGroup === supplierId) return;
            setProcessingGroup(supplierId);

            router.delete(route('purchase.cart.destroy.supplier'), {
                data: { supplier_id: supplierId },
                preserveScroll: true,
                onFinish: () => {
                    setProcessingGroup(false);
                    setSelectedSuppliers((prev) => ({
                        ...prev,
                        [supplierId]: false,
                    }));
                },
                onError: () => setProcessingGroup(false),
            });
        },
        [processingGroup]
    );

    const toggleSupplierSelection = useCallback((supplierId) => {
        const key = supplierId === null ? 'null' : supplierId;
        setSelectedSuppliers((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    }, []);

    const isSupplierSelected = useCallback(
        (supplierId) => {
            const key = supplierId === null ? 'null' : supplierId;
            return !!selectedSuppliers[key];
        },
        [selectedSuppliers]
    );

    const removeSelectedGroups = useCallback(() => {
        const supplierIdsToRemove = Object.entries(selectedSuppliers)
            .filter(([, isSelected]) => isSelected)
            .map(([supplierId]) =>
                supplierId === 'null' ? null : parseInt(supplierId)
            );

        if (supplierIdsToRemove.length === 0) {
            return;
        }

        supplierIdsToRemove.forEach((id) => removeSupplierGroup(id));
    }, [selectedSuppliers, removeSupplierGroup]);

    const hasSelectedGroups = useMemo(
        () => Object.values(selectedSuppliers).some((isSelected) => isSelected),
        [selectedSuppliers]
    );

    const updateCartItem = useCallback((item, field, value) => {
        const isQty = field === 'quantity';
        const localStateSetter = isQty ? setLocalQuantities : setLocalCosts;
        const cleanedValue = cleanNumberString(value);

        localStateSetter((prev) => ({ ...prev, [item.id]: value }));

        if (updateTimeoutRef.current[item.id]) {
            clearTimeout(updateTimeoutRef.current[item.id]);
        }

        if (value === '') return;

        updateTimeoutRef.current[item.id] = setTimeout(() => {
            const newNumericValue = parseFloat(cleanedValue);
            const payload = {};

            if (isQty) {
                payload.quantity =
                    isNaN(newNumericValue) || newNumericValue <= 0
                        ? 1
                        : newNumericValue;
            } else {
                payload.cost_per_unit =
                    isNaN(newNumericValue) || newNumericValue < 0
                        ? 0
                        : newNumericValue;
            }

            if (
                (isQty &&
                    payload.quantity === 1 &&
                    (isNaN(newNumericValue) || newNumericValue <= 0)) ||
                !isQty
            ) {
            }

            setProcessingItem(item.id);
            router.patch(
                route('purchase.cart.update', { cartItem: item.id }),
                payload,
                {
                    preserveScroll: true,
                    onFinish: () => {
                        setProcessingItem(null);
                        localStateSetter((prev) => {
                            const newState = { ...prev };
                            delete newState[item.id];
                            return newState;
                        });
                    },
                    onError: () => {},
                }
            );
        }, 800);
    }, []);

    const getItemQuantity = useCallback(
        (item) => {
            if (localQuantities[item.id] !== undefined) {
                return localQuantities[item.id];
            }
            return formatNumber(item.quantity);
        },
        [localQuantities]
    );

    const getItemCost = useCallback(
        (item) => {
            if (localCosts[item.id] !== undefined) {
                return localCosts[item.id];
            }
            return item.cost_per_unit?.toString() || '0';
        },
        [localCosts]
    );

    const totalCartItems = cart.length;

    return {
        cart: effectiveCart,
        cartGroups,
        selectedProductIds,
        processingItem,
        processingGroup,
        selectedSuppliers,
        addItem,
        removeItem,
        removeSupplierGroup,
        toggleSupplierSelection,
        isSupplierSelected,
        removeSelectedGroups,
        hasSelectedGroups,
        updateCartItem,
        getItemQuantity,
        getItemCost,
        totalCartItems,
    };
}

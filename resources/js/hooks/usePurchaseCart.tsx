import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { formatNumber } from '@/lib/utils';
import { DEFAULT_SUPPLIER_NAME } from '@/constants/strings';

const cleanNum = (str) => typeof str !== 'string' ? String(str) : str.replace(/\./g, '').replace(/,/g, '.');
const clearMapEntry = (map, key) => {
    const next = { ...map };
    delete next[key];
    return next;
};
const persistCartUpdate = (itemId, payload, cleanupState) => {
    router.patch(route('purchase.cart.update', { cartItem: itemId }), payload, {
        preserveScroll: true,
        preserveState: true,
        onFinish: () => cleanupState(),
    });
};

export default function usePurchaseCart(initialCart = []) {
    const [cart, setCart] = useState(initialCart);
    const [processingItem, setProcessingItem] = useState(null);
    const [processingGroup, setProcessingGroup] = useState(false);
    const [selectedSuppliers, setSelectedSuppliers] = useState({});
    const [localQuantities, setLocalQuantities] = useState({});
    const [localCosts, setLocalCosts] = useState({});
    const updateTimeoutRef = useRef({});

    useEffect(() => { setCart(initialCart); }, [initialCart]);

    const effectiveCart = useMemo(() => cart.map((item) => ({
        ...item,
        quantity: localQuantities[item.id] !== undefined ? localQuantities[item.id] : item.quantity,
        cost_per_unit: localCosts[item.id] !== undefined ? localCosts[item.id] : item.cost_per_unit,
    })), [cart, localQuantities, localCosts]);

    const cartGroups = useMemo(() => effectiveCart.reduce((acc, item) => {
        const supplierName = item.supplier?.name || DEFAULT_SUPPLIER_NAME;
        if (!acc[supplierName]) acc[supplierName] = { supplier_id: item.supplier?.id || null, items: [] };
        acc[supplierName].items.push(item);
        return acc;
    }, {}), [effectiveCart]);

    const selectedProductIds = useMemo(() => effectiveCart.map((item) => item.product.id), [effectiveCart]);
    const clearCart = useCallback((cb) => { setCart([]); if (cb) cb(); }, []);

    const getItemQuantity = useCallback((item) => localQuantities[item.id] !== undefined ? localQuantities[item.id] : formatNumber(item.quantity), [localQuantities]);
    const getItemCost = useCallback((item) => localCosts[item.id] !== undefined ? localCosts[item.id] : item.cost_per_unit?.toString() || '0', [localCosts]);

    const syncItemQuantity = useCallback((itemId, newQty) => {
        if (updateTimeoutRef.current[itemId]) clearTimeout(updateTimeoutRef.current[itemId]);

        updateTimeoutRef.current[itemId] = setTimeout(() => {
            const payload = { quantity: isNaN(newQty) || newQty <= 0 ? 1 : newQty };
            persistCartUpdate(itemId, payload, () => setLocalQuantities((prev) => clearMapEntry(prev, itemId)));
        }, 300);
    }, []);

    const removeItem = useCallback((itemId) => {
        router.delete(route('purchase.cart.destroy.item', itemId), {
            preserveScroll: true,
            preserveState: true,
        });
    }, []);

    const addItem = useCallback((product, customSupplierId = undefined, initialCost = 0) => {
        const supId = customSupplierId !== undefined ? customSupplierId : product.default_supplier_id;
        const exist = effectiveCart.find((item) => item.product.id === product.id && (item.supplier_id || null) === (supId || null));

        if (exist) {
            const currentQty = parseFloat(cleanNum(getItemQuantity(exist))) || 0;
            const nextQty = currentQty + 1;
            setLocalQuantities((prev) => ({ ...prev, [exist.id]: nextQty }));
            syncItemQuantity(exist.id, nextQty);
            return;
        }

        router.post(route('purchase.cart.store'), {
            product_id: product.id,
            supplier_id: supId,
            quantity: 1,
            cost_per_unit: initialCost,
        }, {
            preserveScroll: true,
            preserveState: true,
        });
    }, [effectiveCart, getItemQuantity, syncItemQuantity]);

    const removeSupplierGroup = useCallback((supplierId) => {
        if (processingGroup === supplierId) return;
        setProcessingGroup(supplierId);
        router.delete(route('purchase.cart.destroy.supplier'), {
            data: { supplier_id: supplierId },
            preserveScroll: true,
            preserveState: true,
            onFinish: () => {
                setProcessingGroup(false);
                setSelectedSuppliers((prev) => ({ ...prev, [supplierId]: false }));
            },
            onError: () => setProcessingGroup(false),
        });
    }, [processingGroup]);

    const updateCartItem = useCallback((item, field, fieldValue) => {
        const isQty = field === 'quantity';
        const setter = isQty ? setLocalQuantities : setLocalCosts;
        setter((prev) => ({ ...prev, [item.id]: fieldValue }));

        if (updateTimeoutRef.current[item.id]) clearTimeout(updateTimeoutRef.current[item.id]);
        if (fieldValue === '') return;

        updateTimeoutRef.current[item.id] = setTimeout(() => {
            const numVal = parseFloat(cleanNum(fieldValue));
            const payload = isQty
                ? { quantity: isNaN(numVal) || numVal <= 0 ? 1 : numVal }
                : { cost_per_unit: isNaN(numVal) || numVal < 0 ? 0 : numVal };

            persistCartUpdate(item.id, payload, () => setter((prev) => clearMapEntry(prev, item.id)));
        }, 300);
    }, []);

    return {
        cartGroups,
        selectedProductIds,
        processingItem,
        processingGroup,
        selectedSuppliers,
        addItem,
        removeItem,
        removeSupplierGroup,
        updateCartItem,
        getItemQuantity,
        getItemCost,
        totalCartItems: cart.length,
        clearCart,
    };
}

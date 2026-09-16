import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { formatNumber } from '@/lib/utils';
import { DEFAULT_SUPPLIER_NAME } from '@/constants/strings';
import { APP_CONFIG } from '@/constants/config';

const cleanNum = (str) => (typeof str !== 'string' ? String(str) : str.replace(/\./g, '').replace(/,/g, '.'));
const clearEntry = (map, key) => { const n = { ...map }; delete n[key]; return n; };

export default function usePurchaseCart(initialCart = []) {
    const [cart, setCart] = useState(initialCart);
    const [optimisticItems, setOptimisticItems] = useState([]);
    const [processingItem, setProcessingItem] = useState(null);
    const [processingGroup, setProcessingGroup] = useState(false);
    const [selectedSuppliers, setSelectedSuppliers] = useState({});
    const [localQuantities, setLocalQuantities] = useState({});
    const [localCosts, setLocalCosts] = useState({});
    const updateTimeoutRef = useRef({});

    useEffect(() => {
        setCart(initialCart);
        setOptimisticItems((prev) => prev.filter((opt) => !initialCart.some((sc) => sc.product.id === opt.product.id && (sc.supplier_id || null) === (opt.supplier_id || null))));
    }, [initialCart]);

    const mergedCart = useMemo(() => [...cart, ...optimisticItems], [cart, optimisticItems]);

    const effectiveCart = useMemo(() => mergedCart.map((item) => ({
        ...item,
        quantity: localQuantities[item.id] !== undefined ? localQuantities[item.id] : item.quantity,
        cost_per_unit: localCosts[item.id] !== undefined ? localCosts[item.id] : item.cost_per_unit,
    })), [mergedCart, localQuantities, localCosts]);

    const cartGroups = useMemo(() => effectiveCart.reduce((acc, item) => {
        const name = item.supplier?.name || DEFAULT_SUPPLIER_NAME;
        if (!acc[name]) acc[name] = { supplier_id: item.supplier?.id || null, items: [] };
        acc[name].items.push(item);
        return acc;
    }, {}), [effectiveCart]);

    const selectedProductIds = useMemo(() => effectiveCart.map((item) => item.product.id), [effectiveCart]);
    const clearCart = useCallback((cb) => { setCart([]); setOptimisticItems([]); if (cb) cb(); }, []);
    const getItemQuantity = useCallback((item) => (localQuantities[item.id] !== undefined ? localQuantities[item.id] : formatNumber(item.quantity)), [localQuantities]);
    const getItemCost = useCallback((item) => (localCosts[item.id] !== undefined ? localCosts[item.id] : item.cost_per_unit?.toString() || '0'), [localCosts]);

    const persistCartUpdate = useCallback((itemId, payload, cleanup) => {
        router.patch(route('purchase.cart.update', { cartItem: itemId }), payload, {
            only: ['cart'], preserveScroll: true, preserveState: true, onFinish: cleanup,
        });
    }, []);

    const flushCartItem = useCallback((item, field) => {
        if (updateTimeoutRef.current[item.id]) {
            clearTimeout(updateTimeoutRef.current[item.id]);
            delete updateTimeoutRef.current[item.id];
            const isQty = field === 'quantity';
            const val = parseFloat(cleanNum(isQty ? localQuantities[item.id] : localCosts[item.id]));
            const payload = isQty ? { quantity: isNaN(val) || val <= 0 ? 1 : val } : { cost_per_unit: isNaN(val) || val < 0 ? 0 : val };
            const setter = isQty ? setLocalQuantities : setLocalCosts;
            persistCartUpdate(item.id, payload, () => setter((prev) => clearEntry(prev, item.id)));
        }
    }, [localQuantities, localCosts, persistCartUpdate]);

    const updateCartItem = useCallback((item, field, fieldValue) => {
        const isQty = field === 'quantity';
        const setter = isQty ? setLocalQuantities : setLocalCosts;
        setter((prev) => ({ ...prev, [item.id]: fieldValue }));
        if (updateTimeoutRef.current[item.id]) clearTimeout(updateTimeoutRef.current[item.id]);
        if (fieldValue === '') return;

        updateTimeoutRef.current[item.id] = setTimeout(() => {
            const numVal = parseFloat(cleanNum(fieldValue));
            const payload = isQty ? { quantity: isNaN(numVal) || numVal <= 0 ? 1 : numVal } : { cost_per_unit: isNaN(numVal) || numVal < 0 ? 0 : numVal };
            persistCartUpdate(item.id, payload, () => setter((prev) => clearEntry(prev, item.id)));
        }, APP_CONFIG.CART_INPUT_DEBOUNCE_MS);
    }, [persistCartUpdate]);

    const removeItem = useCallback((itemId) => {
        if (typeof itemId === 'string' && itemId.startsWith('temp-')) {
            setOptimisticItems((prev) => prev.filter((i) => i.id !== itemId));
            return;
        }
        router.delete(route('purchase.cart.destroy.item', itemId), { only: ['cart'], preserveScroll: true, preserveState: true });
    }, []);

    const addItem = useCallback((product, customSupplierId = undefined, initialCost = 0) => {
        const supId = customSupplierId !== undefined ? customSupplierId : product.default_supplier_id;
        const exist = effectiveCart.find((i) => i.product.id === product.id && (i.supplier_id || null) === (supId || null));

        if (exist) {
            const nextQty = (parseFloat(cleanNum(getItemQuantity(exist))) || 0) + 1;
            updateCartItem(exist, 'quantity', nextQty.toString());
            return;
        }

        const tempId = `temp-${product.id}-${Date.now()}`;
        setOptimisticItems((prev) => [...prev, { id: tempId, product, supplier_id: supId, supplier: product.default_supplier || null, quantity: 1, cost_per_unit: initialCost, isOptimistic: true }]);
        router.post(route('purchase.cart.store'), { product_id: product.id, supplier_id: supId, quantity: 1, cost_per_unit: initialCost }, {
            only: ['cart'], preserveScroll: true, preserveState: true,
            onError: () => setOptimisticItems((prev) => prev.filter((i) => i.id !== tempId)),
        });
    }, [effectiveCart, getItemQuantity, updateCartItem]);

    const removeSupplierGroup = useCallback((supplierId) => {
        if (processingGroup === supplierId) return;
        setProcessingGroup(supplierId);
        router.delete(route('purchase.cart.destroy.supplier'), {
            data: { supplier_id: supplierId }, only: ['cart'], preserveScroll: true, preserveState: true,
            onFinish: () => { setProcessingGroup(false); setSelectedSuppliers((prev) => ({ ...prev, [supplierId]: false })); },
            onError: () => setProcessingGroup(false),
        });
    }, [processingGroup]);

    return {
        cartGroups, selectedProductIds, processingItem, processingGroup, selectedSuppliers,
        addItem, removeItem, removeSupplierGroup, updateCartItem, flushCartItem, getItemQuantity, getItemCost,
        totalCartItems: effectiveCart.length, clearCart,
    };
}

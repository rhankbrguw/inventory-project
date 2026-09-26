import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { APP_CONFIG } from '@/constants/config';

export function useSellCart(cart = [], locationId) {
    const [processingItem, setProcessingItem] = useState(null);
    const [localQuantities, setLocalQuantities] = useState({});
    const [optimisticItems, setOptimisticItems] = useState([]);
    const updateTimeoutRef = useRef({});

    const serverCart = useMemo(() => {
        if (!cart?.length || !locationId) return [];
        return cart.filter((item) => item.location?.id?.toString() === locationId?.toString());
    }, [cart, locationId]);

    useEffect(() => {
        setOptimisticItems((prev) =>
            prev.filter((opt) => !serverCart.some((sc) => sc.product.id === opt.product.id))
        );
    }, [serverCart]);

    const mergedCart = useMemo(() => [...serverCart, ...optimisticItems], [serverCart, optimisticItems]);

    const effectiveCart = useMemo(() => {
        return mergedCart.map((item) => ({
            ...item,
            quantity: localQuantities[item.id] !== undefined ? localQuantities[item.id] : item.quantity,
        }));
    }, [mergedCart, localQuantities]);

    const selectedProductIds = useMemo(() => effectiveCart.map((item) => item.product.id), [effectiveCart]);
    const totalCartItems = useMemo(() => effectiveCart.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0), 0), [effectiveCart]);
    const totalCartPrice = useMemo(() => effectiveCart.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0) * (Number(item.sell_price) || 0), 0), [effectiveCart]);

    const getItemQuantity = useCallback((item) => (localQuantities[item.id] !== undefined ? localQuantities[item.id] : item.quantity), [localQuantities]);

    const syncItemQuantity = useCallback((itemId, newQty, immediate = false) => {
        if (typeof itemId === 'string' && itemId.startsWith('temp-')) return;
        if (updateTimeoutRef.current[itemId]) clearTimeout(updateTimeoutRef.current[itemId]);

        const execute = () => {
            const finalQty = isNaN(newQty) || newQty <= 0 ? 1 : newQty;
            router.patch(route('sell.cart.update', { cartItem: itemId }), { quantity: finalQty }, {
                only: ['cart'], preserveScroll: true, preserveState: true,
                onFinish: () => {
                    setLocalQuantities((prev) => {
                        const cur = prev[itemId];
                        if (cur === undefined || parseFloat(cur) === finalQty) {
                            const next = { ...prev };
                            delete next[itemId];
                            return next;
                        }
                        return prev;
                    });
                },
            });
        };

        if (immediate) execute();
        else updateTimeoutRef.current[itemId] = setTimeout(execute, APP_CONFIG.CART_INPUT_DEBOUNCE_MS);
    }, []);

    const flushItemQuantity = useCallback((itemId) => {
        if (updateTimeoutRef.current[itemId]) {
            clearTimeout(updateTimeoutRef.current[itemId]);
            delete updateTimeoutRef.current[itemId];
            const val = parseFloat(localQuantities[itemId]);
            syncItemQuantity(itemId, isNaN(val) || val <= 0 ? 1 : val, true);
        }
    }, [localQuantities, syncItemQuantity]);

    const updateCartItem = useCallback((item, value) => {
        const normalized = typeof value === 'string' ? value.replace(/,/g, '.') : value;
        const newQty = parseFloat(normalized);
        setLocalQuantities((prev) => ({ ...prev, [item.id]: value }));

        if (value === '') return;
        syncItemQuantity(item.id, isNaN(newQty) || newQty <= 0 ? 1 : newQty);
    }, [syncItemQuantity]);

    const removeItem = useCallback((itemId) => {
        if (!locationId) return;
        if (typeof itemId === 'string' && itemId.startsWith('temp-')) {
            setOptimisticItems((prev) => prev.filter((i) => i.id !== itemId));
            return;
        }
        router.delete(route('sell.cart.destroy.item', { cartItem: itemId }), {
            only: ['cart'], preserveScroll: true, preserveState: true,
        });
    }, [locationId]);

    const addItem = useCallback((product, sellPrice = null, channelId = null) => {
        if (!locationId) return;
        const exist = effectiveCart.find((i) => i.product.id === product.id);

        if (exist) {
            const nextQty = (parseFloat(getItemQuantity(exist)) || 0) + 1;
            setLocalQuantities((prev) => ({ ...prev, [exist.id]: nextQty }));
            syncItemQuantity(exist.id, nextQty);
            return;
        }

        const tempId = `temp-${product.id}-${Date.now()}`;

        setOptimisticItems((prev) => [...prev, {
            id: tempId, product, location: { id: locationId }, quantity: 1,
            sell_price: sellPrice ?? product.price,
        }]);

        router.post(route('sell.cart.store'), {
            product_id: product.id, location_id: locationId, quantity: 1,
            sell_price: sellPrice ?? product.price, sales_channel_id: channelId,
        }, {
            only: ['cart'], preserveScroll: true, preserveState: true,
            onError: () => setOptimisticItems((prev) => prev.filter((i) => i.id !== tempId)),
        });
    }, [locationId, effectiveCart, getItemQuantity, syncItemQuantity]);

    const clearCart = useCallback((onSuccessCallback) => {
        if (!locationId || effectiveCart.length === 0) {
            if (onSuccessCallback) onSuccessCallback();
            return;
        }
        setOptimisticItems([]);
        router.delete(route('sell.cart.destroy.location'), {
            data: { location_id: locationId }, only: ['cart'], preserveScroll: true, preserveState: true,
            onSuccess: () => { if (onSuccessCallback) onSuccessCallback(); },
        });
    }, [locationId, effectiveCart]);

    return {
        cart: effectiveCart, selectedProductIds, processingItem, setProcessingItem, addItem,
        updateCartItem, flushItemQuantity, removeItem, clearCart, totalCartItems, totalCartPrice, getItemQuantity,
    };
}

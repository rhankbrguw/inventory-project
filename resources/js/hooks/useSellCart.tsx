import { useState, useMemo, useCallback, useRef } from 'react';
import { router } from '@inertiajs/react';

export function useSellCart(cart = [], locationId) {
    const [processingItem, setProcessingItem] = useState(null);
    const [localQuantities, setLocalQuantities] = useState({});
    const updateTimeoutRef = useRef({});

    const serverCart = useMemo(() => {
        if (cart.length === 0 || !locationId) return [];
        return cart.filter((item) => item.location?.id?.toString() === locationId?.toString());
    }, [cart, locationId]);

    const effectiveCart = useMemo(() => {
        return serverCart.map((item) => {
            const localQty = localQuantities[item.id];
            return {
                ...item,
                quantity: localQty !== undefined ? localQty : item.quantity,
            };
        });
    }, [serverCart, localQuantities]);

    const selectedProductIds = useMemo(() => effectiveCart.map((item) => item.product.id), [effectiveCart]);
    const totalCartItems = useMemo(() => effectiveCart.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0), 0), [effectiveCart]);
    const totalCartPrice = useMemo(() => effectiveCart.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0) * (Number(item.sell_price) || 0), 0), [effectiveCart]);

    const getItemQuantity = useCallback((item) => {
        return localQuantities[item.id] !== undefined ? localQuantities[item.id] : item.quantity;
    }, [localQuantities]);

    const syncItemQuantity = useCallback((itemId, newQty) => {
        if (updateTimeoutRef.current[itemId]) {
            clearTimeout(updateTimeoutRef.current[itemId]);
        }

        updateTimeoutRef.current[itemId] = setTimeout(() => {
            const payload = { quantity: isNaN(newQty) || newQty <= 0 ? 1 : newQty };
            router.patch(route('sell.cart.update', { cartItem: itemId }), payload, {
                preserveScroll: true,
                preserveState: true,
                onFinish: () => {
                    setLocalQuantities((prev) => {
                        const newState = { ...prev };
                        delete newState[itemId];
                        return newState;
                    });
                },
            });
        }, 300);
    }, []);

    const updateCartItem = useCallback((item, value) => {
        const normalized = typeof value === 'string' ? value.replace(/,/g, '.') : value;
        const newQty = parseFloat(normalized);
        setLocalQuantities((prev) => ({ ...prev, [item.id]: value }));

        if (value === '') return;
        syncItemQuantity(item.id, isNaN(newQty) || newQty <= 0 ? 1 : newQty);
    }, [syncItemQuantity]);

    const removeItem = useCallback((itemId) => {
        if (!locationId) return;
        router.delete(route('sell.cart.destroy.item', { cartItem: itemId }), {
            preserveScroll: true,
            preserveState: true,
        });
    }, [locationId]);

    const addItem = useCallback((product, sellPrice = null, channelId = null) => {
        if (!locationId) return;

        const existingItem = effectiveCart.find((item) => {
            const itemChannelId = item.sales_channel?.id?.toString() || null;
            const targetChannelId = channelId?.toString() || null;
            return item.product.id === product.id && itemChannelId === targetChannelId;
        });

        if (existingItem) {
            const currentQty = parseFloat(getItemQuantity(existingItem)) || 0;
            const nextQty = currentQty + 1;
            setLocalQuantities((prev) => ({ ...prev, [existingItem.id]: nextQty }));
            syncItemQuantity(existingItem.id, nextQty);
        } else {
            router.post(route('sell.cart.store'), {
                product_id: product.id,
                location_id: locationId,
                quantity: 1,
                sell_price: sellPrice ?? product.price,
                sales_channel_id: channelId,
            }, {
                preserveScroll: true,
                preserveState: true,
            });
        }
    }, [locationId, effectiveCart, getItemQuantity, syncItemQuantity]);

    const clearCart = useCallback((onSuccessCallback) => {
        if (!locationId || effectiveCart.length === 0) {
            if (onSuccessCallback) onSuccessCallback();
            return;
        }

        router.delete(route('sell.cart.destroy.location'), {
            data: { location_id: locationId },
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                if (onSuccessCallback) onSuccessCallback();
            },
        });
    }, [locationId, effectiveCart]);

    return {
        cart: effectiveCart,
        selectedProductIds,
        processingItem,
        setProcessingItem,
        addItem,
        updateCartItem,
        removeItem,
        clearCart,
        totalCartItems,
        totalCartPrice,
        getItemQuantity,
    };
}

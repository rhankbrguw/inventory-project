import { useState, useMemo, useCallback, useRef } from 'react';
import { router } from '@inertiajs/react';

export function useSellCart(cart = [], locationId) {
    const [processingItem, setProcessingItem] = useState(null);
    const [localQuantities, setLocalQuantities] = useState({});
    const updateTimeoutRef = useRef({});

    const serverCart = useMemo(() => {
        if (cart.length === 0) return [];
        if (!locationId) return [];
        return cart.filter(
            (item) => item.location?.id.toString() === locationId
        );
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

    const selectedProductIds = useMemo(
        () => effectiveCart.map((item) => item.product.id),
        [effectiveCart]
    );

    const totalCartItems = useMemo(
        () =>
            effectiveCart.reduce(
                (sum, item) => sum + (parseFloat(item.quantity) || 0),
                0
            ),
        [effectiveCart]
    );

    const totalCartPrice = useMemo(
        () =>
            effectiveCart.reduce(
                (sum, item) =>
                    sum +
                    (parseFloat(item.quantity) || 0) *
                        (Number(item.sell_price) || 0),
                0
            ),
        [effectiveCart]
    );

    const updateCartItem = useCallback((item, value) => {
        setLocalQuantities((prev) => ({ ...prev, [item.id]: value }));

        if (updateTimeoutRef.current[item.id]) {
            clearTimeout(updateTimeoutRef.current[item.id]);
        }

        if (value === '') return;

        updateTimeoutRef.current[item.id] = setTimeout(() => {
            const normalizedValue =
                typeof value === 'string' ? value.replace(/,/g, '.') : value;

            const newQty = parseFloat(normalizedValue);

            const payload = {
                quantity: isNaN(newQty) || newQty <= 0 ? 1 : newQty,
            };

            setProcessingItem(item.id);

            router.patch(
                route('sell.cart.update', { cartItem: item.id }),
                payload,
                {
                    preserveScroll: true,
                    onFinish: () => {
                        setProcessingItem(null);
                        setLocalQuantities((prev) => {
                            const newState = { ...prev };
                            delete newState[item.id];
                            return newState;
                        });
                    },
                    onError: () => setProcessingItem(null),
                }
            );
        }, 800);
    }, []);

    const removeItem = useCallback(
        (itemId) => {
            if (!locationId || processingItem) return;
            setProcessingItem(itemId);
            router.delete(
                route('sell.cart.destroy.item', { cartItem: itemId }),
                {
                    preserveScroll: true,
                    onFinish: () => setProcessingItem(null),
                }
            );
        },
        [locationId, processingItem]
    );

    const addItem = useCallback(
        (product, sellPrice = null) => {
            if (!locationId || processingItem === product.id) return;

            const existingItem = effectiveCart.find(
                (item) => item.product.id === product.id
            );

            setProcessingItem(product.id);

            if (existingItem) {
                const currentQty = parseFloat(existingItem.quantity) || 0;
                const newQuantity = currentQty + 1;

                router.patch(
                    route('sell.cart.update', {
                        cartItem: existingItem.id,
                    }),
                    { quantity: newQuantity },
                    {
                        preserveScroll: true,
                        onFinish: () => setProcessingItem(null),
                    }
                );
            } else {
                router.post(
                    route('sell.cart.store'),
                    {
                        product_id: product.id,
                        location_id: locationId,
                        quantity: 1,
                        sell_price: sellPrice ?? product.price,
                    },
                    {
                        preserveScroll: true,
                        onFinish: () => setProcessingItem(null),
                    }
                );
            }
        },
        [locationId, processingItem, effectiveCart]
    );

    const clearCart = useCallback(() => {
        if (!locationId || effectiveCart.length === 0 || processingItem) return;
        setProcessingItem('all');
        router.delete(route('sell.cart.destroy.location'), {
            data: { location_id: locationId },
            preserveScroll: true,
            onFinish: () => setProcessingItem(null),
        });
    }, [locationId, effectiveCart, processingItem]);

    const getItemQuantity = useCallback(
        (item) => {
            if (localQuantities[item.id] !== undefined) {
                return localQuantities[item.id];
            }
            return item.quantity;
        },
        [localQuantities]
    );

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

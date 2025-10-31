import { useState, useMemo } from "react";
import { router } from "@inertiajs/react";
import { useDebouncedCallback } from "use-debounce";

export function useSellCart(initialCart = [], locationId) {
    const [cart, setCart] = useState(initialCart);
    const [processingItem, setProcessingItem] = useState(null);

    const isCartForLocation = useMemo(() => {
        if (cart.length === 0) return true;
        return cart[0].location?.id.toString() === locationId;
    }, [cart, locationId]);

    const activeCart = isCartForLocation ? cart : [];

    const selectedProductIds = useMemo(
        () => activeCart.map((item) => item.product.id),
        [activeCart],
    );

    const totalCartItems = useMemo(
        () => activeCart.reduce((sum, item) => sum + item.quantity, 0),
        [activeCart],
    );

    const totalCartPrice = useMemo(
        () =>
            activeCart.reduce(
                (sum, item) => sum + item.quantity * (item.product.price || 0),
                0,
            ),
        [activeCart],
    );

    const preserveState = {
        preserveScroll: true,
        preserveState: true,
    };

    const updateCartState = (productId) => {
        setProcessingItem(productId);
        return {
            ...preserveState,
            onSuccess: (page) => {
                setCart(page.props.cart.data);
                setProcessingItem(null);
            },
            onError: () => setProcessingItem(null),
        };
    };

    const addItem = (product) => {
        if (!locationId || processingItem) return;
        const existingItem = activeCart.find(
            (item) => item.product.id === product.id,
        );

        if (existingItem) {
            updateItem(existingItem.id, {
                quantity: existingItem.quantity + 1,
            });
        } else {
            router.post(
                route("sell.cart.store"),
                {
                    product_id: product.id,
                    location_id: locationId,
                    quantity: 1,
                },
                updateCartState(product.id),
            );
        }
    };

    const updateItem = useDebouncedCallback((itemId, data) => {
        if (!locationId || processingItem) return;

        router.patch(
            route("sell.cart.update", { cartItem: itemId }),
            data,
            updateCartState(itemId),
        );
    }, 300);

    const removeItem = (itemId) => {
        if (!locationId || processingItem) return;
        router.delete(
            route("sell.cart.destroy.item", { cartItem: itemId }),
            updateCartState(itemId),
        );
    };

    const clearCart = () => {
        if (!locationId || activeCart.length === 0) return;
        router.delete(route("sell.cart.destroy.location"), {
            data: { location_id: locationId },
            ...preserveState,
            onSuccess: (page) => {
                setCart(page.props.cart.data);
                setProcessingItem(null);
            },
            onError: () => setProcessingItem(null),
        });
    };

    return {
        cart: activeCart,
        selectedProductIds,
        processingItem,
        setProcessingItem,
        addItem,
        updateItem,
        removeItem,
        clearCart,
        totalCartItems,
        totalCartPrice,
    };
}

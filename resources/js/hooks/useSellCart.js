import { useState, useMemo, useCallback, useRef } from "react";
import { router } from "@inertiajs/react";
import { formatNumber } from "@/lib/utils";

const cleanNumberString = (numStr) => {
    if (typeof numStr !== "string") {
        return String(numStr);
    }
    return numStr.replace(/\./g, "").replace(/,/g, ".");
};

export function useSellCart(initialCart = [], locationId) {
    const [cart, setCart] = useState(initialCart);
    const [processingItem, setProcessingItem] = useState(null);
    const [localQuantities, setLocalQuantities] = useState({});
    const updateTimeoutRef = useRef({});

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
        () => activeCart.reduce((sum, item) => sum + Number(item.quantity), 0),
        [activeCart],
    );

    const totalCartPrice = useMemo(
        () =>
            activeCart.reduce(
                (sum, item) =>
                    sum +
                    Number(item.quantity) * (Number(item.product.price) || 0),
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
                setLocalQuantities((prev) => {
                    const newState = { ...prev };
                    delete newState[productId];
                    return newState;
                });
            },
            onError: () => setProcessingItem(null),
            onFinish: () => setProcessingItem(null),
        };
    };

    const updateCartItem = useCallback(
        (item, field, value) => {
            const localStateSetter = setLocalQuantities;
            const cleanedValue = cleanNumberString(value);

            localStateSetter((prev) => ({ ...prev, [item.id]: value }));

            if (updateTimeoutRef.current[item.id]) {
                clearTimeout(updateTimeoutRef.current[item.id]);
            }

            if (value === "") return;

            updateTimeoutRef.current[item.id] = setTimeout(() => {
                const newNumericValue = parseFloat(cleanedValue);
                const payload = {};

                payload.quantity =
                    isNaN(newNumericValue) || newNumericValue <= 0
                        ? 1
                        : newNumericValue;

                if (
                    payload.quantity === 1 &&
                    (isNaN(newNumericValue) || newNumericValue <= 0)
                ) {
                    localStateSetter((prev) => ({
                        ...prev,
                        [item.id]: "1",
                    }));
                }

                router.patch(
                    route("sell.cart.update", { cartItem: item.id }),
                    payload,
                    updateCartState(item.id),
                );
            }, 800);
        },
        [locationId],
    );

    const removeItem = useCallback(
        (itemId) => {
            if (!locationId || processingItem) return;
            router.delete(
                route("sell.cart.destroy.item", { cartItem: itemId }),
                updateCartState(itemId),
            );
        },
        [locationId, processingItem],
    );

    const addItem = useCallback(
        (product) => {
            if (!locationId || processingItem === product.id) return;

            const existingItem = activeCart.find(
                (item) => item.product.id === product.id,
            );

            if (existingItem) {
                const newQuantity =
                    parseFloat(String(existingItem.quantity)) + 1;

                router.patch(
                    route("sell.cart.update", {
                        cartItem: existingItem.id,
                    }),
                    { quantity: newQuantity },
                    updateCartState(product.id),
                );
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
        },
        [locationId, processingItem, activeCart],
    );

    const clearCart = useCallback(() => {
        if (!locationId || activeCart.length === 0 || processingItem) return;
        setProcessingItem("all");
        router.delete(route("sell.cart.destroy.location"), {
            data: { location_id: locationId },
            ...preserveState,
            onSuccess: (page) => {
                setCart(page.props.cart.data);
                setProcessingItem(null);
            },
            onError: () => setProcessingItem(null),
            onFinish: () => setProcessingItem(null),
        });
    }, [locationId, activeCart, processingItem]);

    const getItemQuantity = useCallback(
        (item) => {
            if (localQuantities[item.id] !== undefined) {
                return localQuantities[item.id];
            }
            return formatNumber(item.quantity);
        },
        [localQuantities],
    );

    return {
        cart: activeCart,
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

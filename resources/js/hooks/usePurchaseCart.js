import { useState, useMemo, useCallback, useRef } from "react";
import { router } from "@inertiajs/react";
import { toast } from "sonner";
import { formatNumber } from "@/lib/utils";

const cleanNumberString = (numStr) => {
    if (typeof numStr !== "string") {
        return String(numStr);
    }
    return numStr.replace(/\./g, "").replace(/,/g, ".");
};

export default function usePurchaseCart(initialCart = []) {
    const [cart, setCart] = useState(initialCart);
    const [processingItem, setProcessingItem] = useState(null);
    const [processingGroup, setProcessingGroup] = useState(null);
    const [selectedSuppliers, setSelectedSuppliers] = useState({});
    const [localQuantities, setLocalQuantities] = useState({});
    const updateTimeoutRef = useRef({});

    useMemo(() => {
        setCart(initialCart);
    }, [initialCart]);

    const cartGroups = useMemo(() => {
        return cart.reduce((acc, item) => {
            const supplierName = item.supplier.name || "Tanpa Supplier";
            if (!acc[supplierName]) {
                acc[supplierName] = {
                    supplier_id: item.supplier.id,
                    items: [],
                };
            }
            acc[supplierName].items.push(item);
            return acc;
        }, {});
    }, [cart]);

    const selectedProductIds = useMemo(
        () => cart.map((item) => item.product.id),
        [cart],
    );

    const addItem = useCallback(
        (product) => {
            if (processingItem === product.id) return;

            if (!product.default_supplier_id) {
                toast.error("Produk ini tidak memiliki supplier default");
                return;
            }

            const existingItem = cart.find(
                (item) => item.product.id === product.id,
            );

            if (existingItem) {
                removeItem(existingItem.id);
                return;
            }

            setProcessingItem(product.id);
            router.post(
                route("cart.store"),
                {
                    product_id: product.id,
                    supplier_id: product.default_supplier_id,
                    quantity: 1,
                },
                {
                    preserveScroll: true,
                    onFinish: () => setProcessingItem(null),
                    onError: (errors) => {
                        toast.error("Gagal menambahkan item");
                        console.error(errors);
                    },
                },
            );
        },
        [cart, processingItem],
    );

    const removeItem = useCallback(
        (cartItemId) => {
            if (processingItem === cartItemId) return;
            setProcessingItem(cartItemId);
            router.delete(route("cart.destroy.item", cartItemId), {
                preserveScroll: true,
                onFinish: () => setProcessingItem(null),
                onError: (errors) => {
                    toast.error("Gagal menghapus item");
                    console.error(errors);
                },
            });
        },
        [processingItem],
    );

    const removeSupplierGroup = useCallback(
        (supplierId) => {
            if (processingGroup === supplierId) return;
            setProcessingGroup(supplierId);
            router.delete(route("cart.destroy.supplier"), {
                data: { supplier_id: supplierId },
                preserveScroll: true,
                onFinish: () => {
                    setProcessingGroup(null);
                    setSelectedSuppliers((prev) => ({
                        ...prev,
                        [supplierId]: false,
                    }));
                },
                onError: (errors) => {
                    toast.error("Gagal menghapus grup item");
                    console.error(errors);
                },
            });
        },
        [processingGroup],
    );

    const toggleSupplierSelection = useCallback((supplierId) => {
        setSelectedSuppliers((prev) => ({
            ...prev,
            [supplierId]: !prev[supplierId],
        }));
    }, []);

    const isSupplierSelected = useCallback(
        (supplierId) => !!selectedSuppliers[supplierId],
        [selectedSuppliers],
    );

    const removeSelectedGroups = useCallback(() => {
        const supplierIdsToRemove = Object.entries(selectedSuppliers)
            .filter(([, isSelected]) => isSelected)
            .map(([supplierId]) => parseInt(supplierId));

        if (supplierIdsToRemove.length === 0) {
            toast.info("Pilih grup supplier yang ingin dihapus");
            return;
        }

        supplierIdsToRemove.forEach((id) => removeSupplierGroup(id));
    }, [selectedSuppliers, removeSupplierGroup]);

    const hasSelectedGroups = useMemo(
        () => Object.values(selectedSuppliers).some((isSelected) => isSelected),
        [selectedSuppliers],
    );

    const updateQuantity = useCallback((item, quantityString) => {
        setLocalQuantities((prev) => ({ ...prev, [item.id]: quantityString }));

        if (updateTimeoutRef.current[item.id]) {
            clearTimeout(updateTimeoutRef.current[item.id]);
        }

        if (quantityString === "") {
            return;
        }

        updateTimeoutRef.current[item.id] = setTimeout(() => {
            const cleanedString = cleanNumberString(quantityString);
            const newQuantity = parseFloat(cleanedString);

            if (isNaN(newQuantity) || newQuantity <= 0) {
                setLocalQuantities((prev) => ({ ...prev, [item.id]: "1" }));
                router.patch(
                    route("cart.update", { cartItem: item.id }),
                    { quantity: 1 },
                    { preserveScroll: true, preserveState: true },
                );
                return;
            }

            setProcessingItem(item.id);
            router.patch(
                route("cart.update", { cartItem: item.id }),
                {
                    quantity: newQuantity,
                },
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
                    onError: (errors) => {
                        toast.error("Gagal memperbarui jumlah");
                        setLocalQuantities((prev) => ({
                            ...prev,
                            [item.id]: formatNumber(item.quantity),
                        }));
                        console.error(errors);
                    },
                },
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
        [localQuantities],
    );

    const totalCartItems = cart.length;

    return {
        cart,
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
        updateQuantity,
        getItemQuantity,
        totalCartItems,
    };
}

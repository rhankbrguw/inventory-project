import React, { useState, useMemo, useEffect, useRef } from "react";
import { Head, Link, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/layouts/AuthenticatedLayout";
import { useSellCart } from "@/hooks/useSellCart";
import SellProductGrid from "./Partials/SellProductGrid";
import SellCart from "./Partials/SellCart";
import SellCheckoutDialog from "./Partials/SellCheckoutDialog";
import DeleteConfirmationDialog from "@/components/DeleteConfirmationDialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import Pagination from "@/components/Pagination";
import { useDebounce } from "use-debounce";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { formatNumber } from "@/lib/utils";

export default function Create({
    auth,
    locations,
    customers,
    allProducts,
    paymentMethods,
    productTypes = [],
    customerTypes = [],
    cart: { data: initialCart = [] },
    filters = {},
}) {
    const [selectedLocationId, setSelectedLocationId] = useState(
        filters.location_id || initialCart[0]?.location?.id?.toString() || "",
    );
    const [searchQuery, setSearchQuery] = useState(filters.search || "");
    const [selectedType, setSelectedType] = useState(filters.type_id || "all");
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [cartOpen, setCartOpen] = useState(false);
    const [selectedCustomerId, setSelectedCustomerId] = useState(null);
    const [pendingLocationId, setPendingLocationId] = useState(null);
    const [debouncedSearch] = useDebounce(searchQuery, 500);
    const isInitialMount = useRef(true);

    const {
        cart,
        selectedProductIds,
        processingItem,
        addItem,
        removeItem,
        updateCartItem,
        clearCart,
        totalCartItems,
        totalCartPrice,
        getItemQuantity,
    } = useSellCart(initialCart, selectedLocationId);

    useEffect(() => {
        setSelectedLocationId(
            filters.location_id ||
                initialCart[0]?.location?.id?.toString() ||
                "",
        );
    }, [filters.location_id, initialCart]);

    const reloadProducts = (locationId, search, type) => {
        const queryParams = { location_id: locationId };
        if (search) queryParams.search = search;
        if (type && type !== "all") queryParams.type_id = type;

        router.get(route("transactions.sells.create"), queryParams, {
            preserveState: true,
            preserveScroll: true,
            only: ["allProducts", "filters"],
        });
    };

    const handleLocationChange = (locationId) => {
        if (locationId === selectedLocationId) return;

        if (cart.length > 0) {
            setPendingLocationId(locationId);
        } else {
            reloadProducts(locationId, searchQuery, selectedType);
        }
    };

    const confirmLocationChange = () => {
        clearCart();
        setSearchQuery("");
        setSelectedType("all");
        reloadProducts(pendingLocationId, "", "all");
        setPendingLocationId(null);
    };

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        if (selectedLocationId) {
            reloadProducts(selectedLocationId, debouncedSearch, selectedType);
        }
    }, [debouncedSearch, selectedType]);

    const cartProps = {
        cart,
        customers,
        customerTypes,
        selectedCustomerId,
        onCustomerChange: setSelectedCustomerId,
        removeItem,
        updateItem: updateCartItem,
        clearCart,
        processingItem,
        totalCartItems,
        totalCartPrice,
        onCheckout: () => {
            setIsCheckoutOpen(true);
            setCartOpen(false);
        },
        locationId: selectedLocationId,
        getItemQuantity,
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <div className="print-hidden flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                    <Link href={route("transactions.index")}>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Buat Penjualan
                    </h1>
                </div>
            </div>

            <Head title="Buat Penjualan" />

            <div className="flex flex-1 gap-4 min-h-[calc(100vh-13rem)] max-h-[calc(100vh-13rem)]">
                <div className="flex-1 lg:flex-[3] flex flex-col overflow-hidden rounded-lg border bg-card">
                    <SellProductGrid
                        locations={locations}
                        selectedLocationId={selectedLocationId}
                        onLocationChange={handleLocationChange}
                        products={allProducts.data}
                        productTypes={productTypes}
                        selectedType={selectedType}
                        setSelectedType={setSelectedType}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        onProductClick={addItem}
                        selectedProductIds={selectedProductIds}
                        processingItem={processingItem}
                        paginationLinks={allProducts.links}
                    />
                </div>

                <div className="hidden lg:flex flex-[2] flex-col overflow-hidden rounded-lg border bg-card">
                    <SellCart {...cartProps} />
                </div>
            </div>

            <Sheet open={cartOpen} onOpenChange={setCartOpen}>
                <SheetTrigger asChild>
                    <Button
                        className="lg:hidden fixed bottom-4 right-4 h-14 w-14 rounded-full shadow-lg z-50"
                        size="icon"
                    >
                        <ShoppingCart className="h-6 w-6" />
                        {totalCartItems > 0 && (
                            <span className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-destructive text-destructive-foreground text-xs font-bold flex items-center justify-center">
                                {formatNumber(totalCartItems)}
                            </span>
                        )}
                    </Button>
                </SheetTrigger>
                <SheetContent
                    side="right"
                    className="w-full sm:max-w-md p-0 flex flex-col"
                >
                    <SellCart {...cartProps} />
                </SheetContent>
            </Sheet>

            <SellCheckoutDialog
                isOpen={isCheckoutOpen}
                onOpenChange={setIsCheckoutOpen}
                cartItems={cart}
                totalPrice={totalCartPrice}
                locationId={selectedLocationId}
                customerId={selectedCustomerId}
                paymentMethods={paymentMethods}
            />

            <DeleteConfirmationDialog
                open={!!pendingLocationId}
                onOpenChange={() => setPendingLocationId(null)}
                onConfirm={confirmLocationChange}
                title="Kosongkan Keranjang?"
                description="Mengganti lokasi akan mengosongkan keranjang Anda saat ini. Lanjutkan?"
                confirmText="Lanjutkan"
            />
        </AuthenticatedLayout>
    );
}

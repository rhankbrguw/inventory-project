import React, { useState, useMemo } from "react";
import { Head, Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/layouts/AuthenticatedLayout";
import PurchaseDetailsManager from "./Partials/PurchaseDetailsManager";
import PurchaseProductGrid from "./Partials/PurchaseProductGrid";
import PurchaseCart from "./Partials/PurchaseCart";
import usePurchaseCart from "@/hooks/usePurchaseCart";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIndexPageFilters } from "@/hooks/useIndexPageFilters";
import { formatNumber } from "@/lib/utils";

export default function Create({
    auth,
    locations,
    suppliers,
    products,
    paymentMethods,
    productTypes = [],
    cart: { data: initialCart = [] },
    filters,
}) {
    const [checkoutSupplierId, setCheckoutSupplierId] = useState(null);
    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
    const [cartOpen, setCartOpen] = useState(false);

    const {
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
    } = usePurchaseCart(initialCart);

    const { params, setFilter } = useIndexPageFilters(
        "transactions.purchases.create",
        filters,
    );

    const currentSupplierFilter = params.supplier_id || "all";

    const supplierOptions = useMemo(() => suppliers, [suppliers]);

    const filteredCartGroups = useMemo(() => {
        if (currentSupplierFilter === "all") {
            return cartGroups;
        }
        const supplierName =
            suppliers.find((s) => s.id.toString() === currentSupplierFilter)
                ?.name || "Supplier Umum";
        const group = cartGroups[supplierName];
        return group ? { [supplierName]: group } : {};
    }, [cartGroups, currentSupplierFilter, suppliers]);

    const handleSupplierFilterChange = (value) => {
        setFilter("supplier_id", value);
    };

    const handleOpenCheckout = (supplierId) => {
        setCheckoutSupplierId(supplierId);
        setIsCheckoutModalOpen(true);
        setCartOpen(false);
    };

    const handleCloseCheckout = () => {
        setIsCheckoutModalOpen(false);
        setCheckoutSupplierId(null);
    };

    const getCartItemsForCheckout = () => {
        if (checkoutSupplierId === null) {
            return cartGroups["Supplier Umum"]?.items || [];
        }
        const supplierName = suppliers.find(
            (s) => s.id === checkoutSupplierId,
        )?.name;
        return cartGroups[supplierName]?.items || [];
    };

    const cartProps = {
        cartGroups,
        hasSelectedGroups,
        removeSelectedGroups,
        processingGroup,
        removeItem,
        removeSupplierGroup,
        updateItem: updateCartItem,
        getItemQuantity,
        getItemCost,
        setCheckoutSupplierId: handleOpenCheckout,
        processingItem,
        toggleSupplierSelection,
        isSupplierSelected,
        totalCartItems,
        selectedSuppliers,
        suppliers,
        supplierFilter: currentSupplierFilter,
        setSupplierFilter: handleSupplierFilterChange,
        supplierOptions,
        filteredCartGroups,
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
                        Buat Pembelian
                    </h1>
                </div>
            </div>

            <Head title="Buat Pembelian" />

            <div className="flex flex-1 gap-4 min-h-[calc(100vh-13rem)] max-h-[calc(100vh-13rem)]">
                <div className="flex-1 lg:flex-[3] flex flex-col overflow-hidden rounded-lg border bg-card">
                    <PurchaseProductGrid
                        products={products.data}
                        productTypes={productTypes}
                        params={params}
                        setFilter={setFilter}
                        onProductClick={addItem}
                        selectedProductIds={selectedProductIds}
                        processingItem={processingItem}
                        paginationLinks={products.links}
                    />
                </div>

                <div className="hidden lg:flex flex-[2] flex-col overflow-hidden rounded-lg border bg-card">
                    <PurchaseCart {...cartProps} />
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
                    <PurchaseCart {...cartProps} />
                </SheetContent>
            </Sheet>

            <Dialog
                open={isCheckoutModalOpen}
                onOpenChange={handleCloseCheckout}
            >
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Detail Pembelian</DialogTitle>
                        <DialogDescription>
                            Lengkapi informasi untuk menyelesaikan pembelian
                            dari supplier ini
                        </DialogDescription>
                    </DialogHeader>
                    {checkoutSupplierId !== null ||
                        cartGroups["Supplier Umum"] ? (
                        <PurchaseDetailsManager
                            key={
                                checkoutSupplierId === null
                                    ? "null"
                                    : checkoutSupplierId
                            }
                            supplierId={checkoutSupplierId}
                            locations={locations}
                            suppliers={suppliers}
                            paymentMethods={paymentMethods}
                            cartItems={getCartItemsForCheckout()}
                            onClose={handleCloseCheckout}
                        />
                    ) : null}
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}

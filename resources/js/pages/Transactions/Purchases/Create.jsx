import React, { useState, useMemo } from "react";
import { Head, Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/layouts/AuthenticatedLayout";
import TransactionDetailsManager from "./Partials/PurchaseDetailsManager";
import ProductCard from "./Partials/ProductCard";
import PurchaseCart from "./Partials/PurchaseCart";
import usePurchaseCart from "@/hooks/usePurchaseCart";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Search, ShoppingCart, ArrowLeft } from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

export default function Create({
    auth,
    locations,
    suppliers,
    products,
    paymentMethods,
    productTypes = [],
    cart: { data: initialCart = [] },
}) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedType, setSelectedType] = useState("all");
    const [cartOpen, setCartOpen] = useState(false);
    const [checkoutSupplierId, setCheckoutSupplierId] = useState(null);

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

    const filteredProducts = useMemo(
        () =>
            products.filter((p) => {
                const matchesSearch =
                    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    p.sku.toLowerCase().includes(searchQuery.toLowerCase());
                const matchesType =
                    selectedType === "all" ||
                    p.type_id?.toString() === selectedType;
                return matchesSearch && matchesType;
            }),
        [products, searchQuery, selectedType],
    );

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
        setCheckoutSupplierId,
        processingItem,
        toggleSupplierSelection,
        isSupplierSelected,
        totalCartItems,
        selectedSuppliers,
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

            <div className="h-[calc(100vh-13rem)] flex flex-col">
                <div className="flex-shrink-0 space-y-3 mb-4">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <Input
                            placeholder="Cari produk (Nama atau SKU)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 h-9 text-sm"
                        />
                    </div>
                    <div className="flex gap-1.5 overflow-x-auto scrollbar-hide scroll-smooth -mx-1 px-1">
                        <button
                            type="button"
                            onClick={() => setSelectedType("all")}
                            className={cn(
                                "px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border snap-start flex-shrink-0",
                                selectedType === "all"
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:bg-muted/30",
                            )}
                        >
                            Semua
                        </button>
                        {productTypes.map((type) => (
                            <button
                                key={type.id}
                                type="button"
                                onClick={() =>
                                    setSelectedType(type.id.toString())
                                }
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border snap-start flex-shrink-0",
                                    selectedType === type.id.toString()
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:bg-muted/30",
                                )}
                            >
                                {type.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto overscroll-contain pr-1 -mr-3">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-2">
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    onClick={() => addItem(product)}
                                    selected={selectedProductIds.includes(
                                        product.id,
                                    )}
                                    processing={processingItem === product.id}
                                    showPrice={false}
                                />
                            ))
                        ) : (
                            <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                                <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                                    <Search className="w-8 h-8 text-muted-foreground/50" />
                                </div>
                                <p className="text-sm font-medium text-foreground mb-1">
                                    Produk tidak ditemukan
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Coba kata kunci lain
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <Sheet open={cartOpen} onOpenChange={setCartOpen}>
                    <SheetTrigger asChild>
                        <Button
                            className="fixed bottom-4 right-4 h-14 w-14 rounded-full shadow-lg z-50"
                            size="icon"
                        >
                            <ShoppingCart className="h-6 w-6" />
                            {totalCartItems > 0 && (
                                <span className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-destructive text-destructive-foreground text-xs font-bold flex items-center justify-center">
                                    {totalCartItems}
                                </span>
                            )}
                        </Button>
                    </SheetTrigger>
                    <SheetContent
                        side="right"
                        className="w-full sm:max-w-md p-0 flex flex-col"
                    >
                        <SheetHeader className="px-3 py-2.5 border-b flex-shrink-0">
                            <SheetTitle className="text-left text-base">
                                Keranjang Pembelian
                            </SheetTitle>
                        </SheetHeader>
                        <div className="flex-1 overflow-hidden">
                            <PurchaseCart {...cartProps} />
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            <Dialog
                open={!!checkoutSupplierId}
                onOpenChange={(open) => !open && setCheckoutSupplierId(null)}
            >
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Detail Pembelian</DialogTitle>
                        <DialogDescription>
                            Lengkapi informasi untuk menyelesaikan pembelian
                            dari supplier ini
                        </DialogDescription>
                    </DialogHeader>
                    <TransactionDetailsManager
                        key={checkoutSupplierId}
                        supplierId={checkoutSupplierId}
                        locations={locations}
                        suppliers={suppliers}
                        paymentMethods={paymentMethods}
                        cartItems={
                            cartGroups[
                                suppliers.find(
                                    (s) => s.id === checkoutSupplierId,
                                )?.name
                            ]?.items || []
                        }
                        onClose={() => setCheckoutSupplierId(null)}
                    />
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}

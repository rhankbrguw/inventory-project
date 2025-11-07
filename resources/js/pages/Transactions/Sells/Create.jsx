import React, { useState, useMemo, useEffect } from "react";
import { Head, Link, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/layouts/AuthenticatedLayout";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useSellCart } from "@/hooks/useSellCart";
import SellProductGrid from "./Partials/SellProductGrid";
import SellCart from "./Partials/SellCart";
import SellCheckoutDialog from "./Partials/SellCheckoutDialog";
import DeleteConfirmationDialog from "@/components/DeleteConfirmationDialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

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
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedType, setSelectedType] = useState("all");
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [selectedCustomerId, setSelectedCustomerId] = useState(null);
    const [pendingLocationId, setPendingLocationId] = useState(null);

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

    const filteredProducts = useMemo(
        () =>
            allProducts.filter((p) => {
                const matchesSearch =
                    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    p.sku.toLowerCase().includes(searchQuery.toLowerCase());
                const matchesType =
                    selectedType === "all" ||
                    p.type_id?.toString() === selectedType;
                return matchesSearch && matchesType;
            }),
        [allProducts, searchQuery, selectedType],
    );

    const handleLocationChange = (locationId) => {
        if (locationId === selectedLocationId) return;

        if (cart.length > 0) {
            setPendingLocationId(locationId);
        } else {
            reloadProducts(locationId);
        }
    };

    const confirmLocationChange = () => {
        clearCart();
        reloadProducts(pendingLocationId);
        setPendingLocationId(null);
    };

    const reloadProducts = (locationId) => {
        router.get(
            route("transactions.sells.create"),
            { location_id: locationId },
            {
                preserveState: true,
                preserveScroll: true,
                only: ["allProducts", "filters"],
            },
        );
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

            <div className="flex flex-1 gap-4 overflow-hidden h-[calc(100vh-13rem)]">
                <div className="flex-[3] flex flex-col h-full overflow-hidden">
                    <div className="flex-shrink-0 mb-4">
                        <Label htmlFor="location_id">Lokasi Penjualan</Label>
                        <Select
                            value={selectedLocationId}
                            onValueChange={handleLocationChange}
                        >
                            <SelectTrigger id="location_id" className="h-9">
                                <SelectValue placeholder="Pilih lokasi untuk memulai" />
                            </SelectTrigger>
                            <SelectContent>
                                {locations.map((loc) => (
                                    <SelectItem
                                        key={loc.id}
                                        value={loc.id.toString()}
                                    >
                                        {loc.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <SellProductGrid
                        products={filteredProducts}
                        productTypes={productTypes}
                        selectedType={selectedType}
                        setSelectedType={setSelectedType}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        onProductClick={addItem}
                        selectedProductIds={selectedProductIds}
                        processingItem={processingItem}
                        locationId={selectedLocationId}
                    />
                </div>

                <div className="flex-[2] h-full overflow-hidden rounded-lg border bg-card">
                    <SellCart
                        cart={cart}
                        customers={customers}
                        customerTypes={customerTypes}
                        selectedCustomerId={selectedCustomerId}
                        onCustomerChange={setSelectedCustomerId}
                        removeItem={removeItem}
                        updateItem={updateCartItem}
                        clearCart={clearCart}
                        processingItem={processingItem}
                        totalCartItems={totalCartItems}
                        totalCartPrice={totalCartPrice}
                        onCheckout={() => setIsCheckoutOpen(true)}
                        locationId={selectedLocationId}
                        getItemQuantity={getItemQuantity}
                    />
                </div>
            </div>

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

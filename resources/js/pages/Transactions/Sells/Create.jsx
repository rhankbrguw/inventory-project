import React, { useState, useMemo } from "react";
import { Head } from "@inertiajs/react";
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

export default function Create({
    auth,
    locations,
    customers,
    allProducts,
    paymentMethods,
    productTypes = [],
    cart: { data: initialCart = [] },
}) {
    const [selectedLocationId, setSelectedLocationId] = useState(
        initialCart[0]?.location?.id?.toString() || "",
    );
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedType, setSelectedType] = useState("all");
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

    const {
        cart,
        selectedProductIds,
        processingItem,
        addItem,
        removeItem,
        updateItem,
        clearCart,
        totalCartItems,
        totalCartPrice,
    } = useSellCart(initialCart, selectedLocationId);

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
        if (
            cart.length > 0 &&
            !confirm("Mengganti lokasi akan mengosongkan keranjang. Lanjutkan?")
        ) {
            return;
        }
        if (cart.length > 0) {
            clearCart();
        }
        setSelectedLocationId(locationId);
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            headerProps={{
                title: "Point of Sale (POS)",
                backRoute: "transactions.index",
            }}
        >
            <Head title="Point of Sale (POS)" />

            <div className="flex h-[calc(100vh-8.5rem)] gap-4">
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
                        removeItem={removeItem}
                        updateItem={updateItem}
                        clearCart={clearCart}
                        processingItem={processingItem}
                        totalCartItems={totalCartItems}
                        totalCartPrice={totalCartPrice}
                        onCheckout={() => setIsCheckoutOpen(true)}
                        locationId={selectedLocationId}
                    />
                </div>
            </div>

            <SellCheckoutDialog
                isOpen={isCheckoutOpen}
                onOpenChange={setIsCheckoutOpen}
                cartItems={cart}
                totalPrice={totalCartPrice}
                locationId={selectedLocationId}
                paymentMethods={paymentMethods}
            />
        </AuthenticatedLayout>
    );
}

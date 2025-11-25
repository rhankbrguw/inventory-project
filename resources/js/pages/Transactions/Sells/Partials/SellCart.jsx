import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Trash2, ShoppingBag, UserPlus } from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/utils";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import QuickAddCustomerModal from "@/components/QuickAddCustomerModal";
import SellItemManager from "./SellItemManager";

export default function SellCart({
    cart,
    customers,
    customerTypes,
    selectedCustomerId,
    onCustomerChange,
    removeItem,
    updateItem,
    clearCart,
    processingItem,
    totalCartItems,
    totalCartPrice,
    onCheckout,
    locationId,
    getItemQuantity,
}) {
    const hasItems = cart.length > 0;
    const isCartDisabled = !locationId || processingItem !== null;

    const handleNewCustomer = (newCustomer) => {
        onCustomerChange(newCustomer.id.toString());
    };

    return (
        <div className="flex flex-col h-full">
            <div className="p-3 border-b flex-shrink-0">
                <h3 className="text-base font-semibold">Keranjang</h3>
                <div className="mt-2 space-y-2">
                    <Label htmlFor="customer_id">Pelanggan</Label>
                    <div className="flex gap-2">
                        <Select
                            value={selectedCustomerId || ""}
                            onValueChange={(value) =>
                                onCustomerChange(
                                    value === "null" ? null : value,
                                )
                            }
                        >
                            <SelectTrigger
                                id="customer_id"
                                className="h-9 text-xs"
                            >
                                <SelectValue placeholder="Pelanggan Umum" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="null">
                                    Pelanggan Umum
                                </SelectItem>
                                {customers.map((cust) => (
                                    <SelectItem
                                        key={cust.id}
                                        value={cust.id.toString()}
                                    >
                                        {cust.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <QuickAddCustomerModal
                            customerTypes={customerTypes}
                            onSuccess={handleNewCustomer}
                        >
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-9 w-9 flex-shrink-0"
                            >
                                <UserPlus className="h-4 w-4" />
                            </Button>
                        </QuickAddCustomerModal>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {!hasItems ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center h-full">
                        <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                            <ShoppingBag className="w-8 h-8 text-muted-foreground/40" />
                        </div>
                        <p className="text-sm font-semibold text-foreground mb-1">
                            Keranjang masih kosong
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Pilih produk dari katalog untuk memulai
                        </p>
                    </div>
                ) : (
                    <SellItemManager
                        cart={cart}
                        removeItem={removeItem}
                        updateItem={updateItem}
                        processingItem={processingItem}
                        getItemQuantity={getItemQuantity}
                        locationId={locationId}
                    />
                )}
            </div>

            <div className="flex-shrink-0 border-t bg-muted/30 p-3 space-y-3">
                <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-muted-foreground">
                        Total Item
                    </p>
                    <p className="text-sm font-bold text-foreground">
                        {formatNumber(totalCartItems)}
                    </p>
                </div>
                <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-muted-foreground">
                        Total Harga
                    </p>
                    <p className="text-lg font-bold text-primary">
                        {formatCurrency(totalCartPrice)}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 text-destructive hover:text-destructive"
                        onClick={clearCart}
                        disabled={isCartDisabled || !hasItems}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        className="w-full h-9 font-semibold"
                        onClick={onCheckout}
                        disabled={isCartDisabled || !hasItems}
                    >
                        Checkout
                    </Button>
                </div>
            </div>
        </div>
    );
}

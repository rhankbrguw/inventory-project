import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ShoppingBag, UserPlus } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
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
    processingItem,
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
        <div className="flex flex-col h-full bg-card">
            <div className="p-4 border-b flex-shrink-0 space-y-4">
                <h3 className="text-base font-semibold">Keranjang Penjualan</h3>
                <div className="space-y-2">
                    <Label
                        htmlFor="customer_id"
                        className="text-xs text-muted-foreground"
                    >
                        Pelanggan
                    </Label>
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
                    <div className="flex flex-col items-center justify-center py-12 text-center h-full p-6">
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
                    <div className="flex flex-col h-full">
                        <SellItemManager
                            cart={cart}
                            removeItem={removeItem}
                            updateItem={updateItem}
                            processingItem={processingItem}
                            getItemQuantity={getItemQuantity}
                            locationId={locationId}
                        />

                        <div className="p-4 mt-auto border-t bg-muted/10 space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-muted-foreground">
                                        Total Penjualan
                                    </span>
                                    <span className="text-lg font-bold text-foreground">
                                        {formatCurrency(totalCartPrice)}
                                    </span>
                                </div>
                            </div>

                            <Button
                                type="button"
                                className="w-full font-semibold"
                                onClick={onCheckout}
                                disabled={isCartDisabled}
                            >
                                Checkout
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

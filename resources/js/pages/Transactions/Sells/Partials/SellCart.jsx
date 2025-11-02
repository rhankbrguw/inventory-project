import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, ShoppingBag, X } from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const cleanNumberString = (numStr) => {
    if (typeof numStr !== "string") {
        return String(numStr);
    }
    return numStr.replace(/\./g, "").replace(/,/g, ".");
};

export default function SellCart({
    cart,
    customers,
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
    const LoadingSpinner = () => (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
    );

    const hasItems = cart.length > 0;
    const isCartDisabled = !locationId || processingItem !== null;

    return (
        <div className="flex flex-col h-full">
            <div className="p-3 border-b flex-shrink-0">
                <h3 className="text-base font-semibold">Keranjang</h3>
                <div className="mt-2">
                    <Label htmlFor="customer_id">Pelanggan</Label>
                    <Select>
                        <SelectTrigger id="customer_id" className="h-9 text-xs">
                            <SelectValue placeholder="Pelanggan Umum" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="null">Pelanggan Umum</SelectItem>
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
                </div>
            </div>

            <ScrollArea className="flex-1">
                {!hasItems && (
                    <div className="flex flex-col items-center justify-center py-12 text-center h-full">
                        <ShoppingBag className="w-16 h-16 text-muted-foreground/30" />
                        <p className="mt-3 text-sm font-semibold text-foreground">
                            Keranjang kosong
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Pilih produk dari katalog untuk memulai.
                        </p>
                    </div>
                )}

                {hasItems && (
                    <div className="p-3 space-y-2">
                        {cart.map((item) => {
                            const isItemProcessing = processingItem === item.id;
                            const subtotal =
                                Number(item.quantity) *
                                (Number(item.product.price) || 0);

                            return (
                                <div
                                    key={item.id}
                                    className="pb-2 border-b last:border-b-0"
                                >
                                    <div className="flex items-center justify-between gap-2 mb-2">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-xs leading-tight truncate text-foreground">
                                                {item.product.name}
                                            </p>
                                            <p className="text-[11px] text-muted-foreground mt-0.5">
                                                {formatCurrency(
                                                    item.product.price,
                                                )}
                                            </p>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeItem(item.id)}
                                            disabled={isItemProcessing}
                                            className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                                        >
                                            {isItemProcessing ? (
                                                <LoadingSpinner />
                                            ) : (
                                                <X className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Input
                                            id={`qty-${item.id}`}
                                            type="text"
                                            inputMode="numeric"
                                            value={getItemQuantity(item)}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                updateItem(
                                                    item,
                                                    "quantity",
                                                    value,
                                                );
                                            }}
                                            onBlur={(e) => {
                                                const value = e.target.value;
                                                const cleanedValue =
                                                    cleanNumberString(value);

                                                if (
                                                    cleanedValue === "" ||
                                                    parseFloat(cleanedValue) <=
                                                    0
                                                ) {
                                                    updateItem(
                                                        item,
                                                        "quantity",
                                                        "1",
                                                    );
                                                } else {
                                                    updateItem(
                                                        item,
                                                        "quantity",
                                                        formatNumber(
                                                            cleanedValue,
                                                        ),
                                                    );
                                                }
                                            }}
                                            onFocus={(e) => {
                                                e.target.select();
                                            }}
                                            disabled={isItemProcessing}
                                            className="h-8 text-xs w-20 text-center"
                                            autoComplete="off"
                                        />
                                        <div className="flex-1 text-right">
                                            <p className="text-sm font-bold text-primary">
                                                {formatCurrency(subtotal)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </ScrollArea>

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

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/utils";

const cleanNumberString = (numStr) => {
    if (typeof numStr !== "string") {
        return String(numStr);
    }
    return numStr.replace(/\./g, "").replace(/,/g, ".");
};

export default function SellItemManager({
    cart,
    removeItem,
    updateItem,
    processingItem,
    getItemQuantity,
}) {
    const LoadingSpinner = () => (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
    );

    return (
        <div className="p-3 pb-4 space-y-2">
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
                                    {formatCurrency(item.product.price)}
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
                                    updateItem(item, "quantity", value);
                                }}
                                onBlur={(e) => {
                                    const value = e.target.value;
                                    const cleanedValue =
                                        cleanNumberString(value);

                                    if (
                                        cleanedValue === "" ||
                                        parseFloat(cleanedValue) <= 0
                                    ) {
                                        updateItem(item, "quantity", "1");
                                    } else {
                                        updateItem(
                                            item,
                                            "quantity",
                                            formatNumber(cleanedValue),
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
    );
}

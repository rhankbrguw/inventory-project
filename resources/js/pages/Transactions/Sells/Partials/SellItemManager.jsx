import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/utils";
import StockAvailability from "@/components/StockAvailability";

export default function SellItemManager({
    cart,
    removeItem,
    updateItem,
    processingItem,
    getItemQuantity,
    locationId,
}) {
    const LoadingSpinner = () => (
        <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
    );

    const getDisplayValue = (item) => {
        const val = getItemQuantity(item);
        if (val === "" || val === null || val === undefined) return "";
        if (typeof val === "string" && val.endsWith(",")) return val;
        return formatNumber(val);
    };

    if (cart.length === 0) {
        return null;
    }

    return (
        <div className="space-y-3">
            {cart.map((item) => {
                const isItemProcessing = processingItem === item.id;
                const priceToUse = item.sell_price || item.product.price;
                const subtotal =
                    Number(item.quantity) * Number(priceToUse || 0);

                return (
                    <div
                        key={item.id}
                        className="p-3 border rounded-lg bg-card space-y-3"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm leading-tight text-foreground">
                                    {item.product.name}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                    <p className="text-xs text-muted-foreground">
                                        {formatCurrency(priceToUse)}
                                    </p>
                                    {item.product.unit && (
                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">
                                            {item.product.unit}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeItem(item.id)}
                                disabled={isItemProcessing}
                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                            >
                                {isItemProcessing ? (
                                    <LoadingSpinner />
                                ) : (
                                    <Trash2 className="h-4 w-4" />
                                )}
                            </Button>
                        </div>

                        <div className="flex items-center justify-between gap-4">
                            <div className="space-y-1.5">
                                <label
                                    htmlFor={`qty-${item.id}`}
                                    className="text-xs font-medium text-muted-foreground block"
                                >
                                    Jumlah
                                </label>
                                <div className="w-24">
                                    <Input
                                        id={`qty-${item.id}`}
                                        type="text"
                                        inputMode="numeric"
                                        value={getDisplayValue(item)}
                                        onChange={(e) => {
                                            const rawValue =
                                                e.target.value.replace(
                                                    /\./g,
                                                    "",
                                                );
                                            updateItem(item, rawValue);
                                        }}
                                        onFocus={(e) => e.target.select()}
                                        disabled={isItemProcessing}
                                        className="h-9 text-center font-bold text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        autoComplete="off"
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5 text-right">
                                <p className="text-xs font-medium text-muted-foreground">
                                    Subtotal
                                </p>
                                <p className="text-base font-bold text-foreground">
                                    {formatCurrency(subtotal)}
                                </p>
                            </div>
                        </div>

                        <StockAvailability
                            productId={item.product.id}
                            locationId={locationId}
                            unit={item.product.unit}
                        />
                    </div>
                );
            })}
        </div>
    );
}

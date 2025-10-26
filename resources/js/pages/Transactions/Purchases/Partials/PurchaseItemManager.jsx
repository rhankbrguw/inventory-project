import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, ShoppingBag, Package } from "lucide-react";
import { Label } from "@/components/ui/label";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

const cleanNumberString = (numStr) => {
    if (typeof numStr !== "string") {
        return String(numStr);
    }
    return numStr.replace(/\./g, "").replace(/,/g, ".");
};

export default function PurchaseItemManager({
    cartGroups,
    onRemoveItem,
    onRemoveSupplierGroup,
    onUpdateQuantity,
    getItemQuantity,
    onCheckout,
    processingItem,
    processingGroup,
    toggleSupplierSelection,
    isSupplierSelected,
}) {
    const hasCartItems = Object.keys(cartGroups).length > 0;

    if (!hasCartItems) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
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
        );
    }

    const LoadingSpinner = () => (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
    );

    return (
        <div className="space-y-3">
            {Object.entries(cartGroups).map(([supplierName, groupData]) => {
                const totalGroupCost = groupData.items.reduce((sum, item) => {
                    const quantity =
                        parseFloat(cleanNumberString(getItemQuantity(item))) ||
                        0;
                    const price = parseFloat(item.product.price) || 0;
                    return sum + quantity * price;
                }, 0);
                const isGroupProcessing =
                    processingGroup === groupData.supplier_id;
                const isSelected = isSupplierSelected(groupData.supplier_id);

                return (
                    <div
                        key={groupData.supplier_id}
                        className="rounded-lg border bg-card shadow-sm overflow-hidden"
                    >
                        <div className="flex items-center gap-2 p-2.5 bg-muted/50 border-b">
                            <Checkbox
                                id={`supplier-${groupData.supplier_id}`}
                                checked={isSelected}
                                onCheckedChange={() =>
                                    toggleSupplierSelection(
                                        groupData.supplier_id,
                                    )
                                }
                                disabled={isGroupProcessing}
                                className="flex-shrink-0"
                            />
                            <Label
                                htmlFor={`supplier-${groupData.supplier_id}`}
                                className="text-sm font-semibold text-foreground truncate cursor-pointer flex-1 min-w-0 flex items-center gap-1.5"
                            >
                                <Package className="w-4 h-4 text-primary flex-shrink-0" />
                                {supplierName}
                            </Label>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                    onRemoveSupplierGroup(groupData.supplier_id)
                                }
                                disabled={
                                    isGroupProcessing || processingItem !== null
                                }
                                className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                            >
                                {isGroupProcessing ? (
                                    <LoadingSpinner />
                                ) : (
                                    <Trash2 className="h-3.5 w-3.5" />
                                )}
                            </Button>
                        </div>

                        <div className="p-2.5 space-y-2">
                            {groupData.items.map((item) => {
                                const isItemProcessing =
                                    processingItem === item.id;
                                const subtotal =
                                    (parseFloat(
                                        cleanNumberString(
                                            getItemQuantity(item),
                                        ),
                                    ) || 0) *
                                    (parseFloat(item.product.price) || 0);

                                return (
                                    <div
                                        key={item.id}
                                        className="pb-2 border-b last:border-b-0 last:pb-0"
                                    >
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-xs leading-tight truncate text-foreground">
                                                    {item.product.name}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground mt-0.5">
                                                    {item.product.unit}
                                                </p>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    onRemoveItem(item.id)
                                                }
                                                disabled={
                                                    isItemProcessing ||
                                                    isGroupProcessing
                                                }
                                                className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                                            >
                                                {isItemProcessing ? (
                                                    <LoadingSpinner />
                                                ) : (
                                                    <Trash2 className="h-3 w-3" />
                                                )}
                                            </Button>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <div className="flex-1">
                                                <Input
                                                    type="text"
                                                    inputMode="numeric"
                                                    value={getItemQuantity(
                                                        item,
                                                    )}
                                                    onChange={(e) => {
                                                        const value =
                                                            e.target.value;
                                                        if (
                                                            value === "" ||
                                                            /^[0-9.,]*$/.test(
                                                                value,
                                                            )
                                                        ) {
                                                            onUpdateQuantity(
                                                                item,
                                                                value,
                                                            );
                                                        }
                                                    }}
                                                    onBlur={(e) => {
                                                        const value =
                                                            e.target.value;
                                                        const cleanedValue =
                                                            cleanNumberString(
                                                                value,
                                                            );

                                                        if (
                                                            cleanedValue ===
                                                                "" ||
                                                            parseFloat(
                                                                cleanedValue,
                                                            ) <= 0
                                                        ) {
                                                            onUpdateQuantity(
                                                                item,
                                                                "1",
                                                            );
                                                        } else {
                                                            onUpdateQuantity(
                                                                item,
                                                                formatNumber(
                                                                    cleanedValue,
                                                                ),
                                                            );
                                                        }
                                                    }}
                                                    onFocus={(e) => {
                                                        const formattedValue =
                                                            e.target.value;
                                                        const cleanedValue =
                                                            cleanNumberString(
                                                                formattedValue,
                                                            );

                                                        e.target.value =
                                                            cleanedValue;

                                                        if (
                                                            formattedValue !==
                                                            cleanedValue
                                                        ) {
                                                            onUpdateQuantity(
                                                                item,
                                                                cleanedValue,
                                                            );
                                                        }

                                                        setTimeout(() => {
                                                            e.target.select();
                                                        }, 0);
                                                    }}
                                                    disabled={
                                                        isItemProcessing ||
                                                        isGroupProcessing
                                                    }
                                                    className="h-8 text-xs"
                                                    autoComplete="off"
                                                />
                                            </div>
                                            <div className="flex-shrink-0 min-w-[80px] text-right">
                                                <p className="text-xs font-bold text-primary">
                                                    {formatCurrency(subtotal)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="p-2.5 border-t bg-muted/30 space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] text-muted-foreground font-semibold">
                                    Subtotal
                                </span>
                                <span className="text-sm font-bold text-primary">
                                    {formatCurrency(totalGroupCost)}
                                </span>
                            </div>
                            <Button
                                type="button"
                                onClick={() =>
                                    onCheckout(groupData.supplier_id)
                                }
                                disabled={
                                    isGroupProcessing || processingItem !== null
                                }
                                className="w-full h-8 text-xs font-semibold"
                            >
                                Checkout
                            </Button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

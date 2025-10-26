import React from "react";
import { Button } from "@/components/ui/button";
import PurchaseItemManager from "./PurchaseItemManager";

export default function PurchaseCart({
    cartGroups,
    hasSelectedGroups,
    removeSelectedGroups,
    processingGroup,
    removeItem,
    removeSupplierGroup,
    updateQuantity,
    getItemQuantity,
    setCheckoutSupplierId,
    processingItem,
    toggleSupplierSelection,
    isSupplierSelected,
    totalCartItems,
    selectedSuppliers,
}) {
    return (
        <div className="flex flex-col h-full">
            {hasSelectedGroups && (
                <div className="px-3 pt-2 pb-3 flex-shrink-0 border-b">
                    <Button
                        variant="destructive"
                        size="sm"
                        className="w-full h-8 text-xs font-semibold"
                        onClick={removeSelectedGroups}
                        disabled={processingGroup !== null}
                    >
                        Hapus{" "}
                        {
                            Object.values(selectedSuppliers).filter(Boolean)
                                .length
                        }{" "}
                        Grup Terpilih
                    </Button>
                </div>
            )}
            <div className="flex-1 overflow-y-auto overscroll-contain px-3 py-3">
                <PurchaseItemManager
                    cartGroups={cartGroups}
                    onRemoveItem={removeItem}
                    onRemoveSupplierGroup={removeSupplierGroup}
                    onUpdateQuantity={updateQuantity}
                    getItemQuantity={getItemQuantity}
                    onCheckout={setCheckoutSupplierId}
                    processingItem={processingItem}
                    processingGroup={processingGroup}
                    toggleSupplierSelection={toggleSupplierSelection}
                    isSupplierSelected={isSupplierSelected}
                />
            </div>

            <div className="flex-shrink-0 border-t bg-muted/30 px-3 py-2.5 sticky bottom-0">
                <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-muted-foreground">
                        Total Item di Keranjang
                    </p>
                    <p className="text-lg font-bold text-foreground">
                        {totalCartItems} item
                    </p>
                </div>
            </div>
        </div>
    );
}

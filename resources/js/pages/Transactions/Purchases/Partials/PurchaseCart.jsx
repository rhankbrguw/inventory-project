import React from "react";
import PurchaseItemManager from "./PurchaseItemManager";

export default function PurchaseCart({
    cartGroups,
    processingGroup,
    removeItem,
    removeSupplierGroup,
    updateItem,
    getItemQuantity,
    getItemCost,
    setCheckoutSupplierId,
    processingItem,
    toggleSupplierSelection,
    isSupplierSelected,
    totalCartItems,
}) {
    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto overscroll-contain px-3 py-3">
                <PurchaseItemManager
                    cartGroups={cartGroups}
                    onRemoveItem={removeItem}
                    onRemoveSupplierGroup={removeSupplierGroup}
                    onUpdateItem={updateItem}
                    getItemQuantity={getItemQuantity}
                    getItemCost={getItemCost}
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
                    <p className="text-base font-bold text-foreground">
                        {totalCartItems}
                    </p>
                </div>
            </div>
        </div>
    );
}

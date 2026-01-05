import React from 'react';
import PurchaseItemManager from './PurchaseItemManager';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import QuickAddSupplierModal from '@/components/QuickAddSupplierModal';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ShoppingBag } from 'lucide-react';
import { formatNumber } from '@/lib/utils';

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
    supplierFilter,
    setSupplierFilter,
    supplierOptions,
    filteredCartGroups,
    canCheckout = true,
}) {
    const hasCartItems = Object.keys(cartGroups).length > 0;

    return (
        <div className="flex flex-col h-full">
            <div className="p-3 border-b flex-shrink-0">
                <h3 className="text-base font-semibold">Keranjang Pembelian</h3>
                <div className="mt-2 space-y-2">
                    <Label htmlFor="supplier-filter">Supplier</Label>
                    <div className="flex gap-2">
                        <Select
                            value={supplierFilter}
                            onValueChange={setSupplierFilter}
                        >
                            <SelectTrigger
                                id="supplier-filter"
                                className="h-9 text-xs"
                            >
                                <SelectValue placeholder="Filter supplier..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    Semua Supplier
                                </SelectItem>
                                <SelectItem value="null">
                                    Supplier Umum
                                </SelectItem>
                                {supplierOptions.map((supplier) => (
                                    <SelectItem
                                        key={supplier.id}
                                        value={supplier.id.toString()}
                                    >
                                        {supplier.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <QuickAddSupplierModal onSuccess={() => {}}>
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-9 w-9 flex-shrink-0"
                            >
                                <UserPlus className="h-4 w-4" />
                            </Button>
                        </QuickAddSupplierModal>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {!hasCartItems ? (
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
                    <div className="p-3 pb-4">
                        <PurchaseItemManager
                            cartGroups={filteredCartGroups}
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
                            canCheckout={canCheckout}
                        />
                    </div>
                )}
            </div>

            <div className="flex-shrink-0 border-t bg-muted/30 px-3 py-2.5">
                <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-muted-foreground">
                        Total Item di Keranjang
                    </p>
                    <p className="text-base font-bold text-foreground">
                        {formatNumber(totalCartItems)}
                    </p>
                </div>
            </div>
        </div>
    );
}

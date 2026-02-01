import PurchaseItemManager from './PurchaseItemManager';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { UserPlus, Building2, Truck, ShoppingBag, X } from 'lucide-react';
import QuickAddSupplierModal from '@/components/QuickAddSupplierModal';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { useState, useEffect } from 'react';

export default function PurchaseCart({
    processingGroup,
    removeItem,
    removeSupplierGroup,
    updateItem,
    getItemQuantity,
    getItemCost,
    processingItem,
    totalCartItems,
    suppliers,
    warehouses = [],
    locations = [],
    cartGroups,
    canCheckout = true,
    onInternalSourceChange,
    selectedSourceId,
    selectedSourceType,
    dynamicTotal,
    onCheckout,
    setFilter,
    onClose,
}) {
    const hasCartItems = totalCartItems > 0;
    const [sourceTab, setSourceTab] = useState(
        selectedSourceType || 'supplier'
    );
    const [supplierOpen, setSupplierOpen] = useState(false);
    const [warehouseOpen, setWarehouseOpen] = useState(false);

    useEffect(() => {
        setSourceTab(selectedSourceType);
    }, [selectedSourceType]);

    const handleTabChange = (value) => {
        if (value === 'supplier') {
            onInternalSourceChange('all', 'supplier');
        } else {
            onInternalSourceChange(null, 'internal');
        }
    };

    const getSupplierLabel = () => {
        if (!selectedSourceId || selectedSourceId === 'all')
            return 'Semua Supplier';
        if (selectedSourceId === 'null') return 'Supplier Umum';
        return (
            suppliers.find((s) => s.id.toString() === selectedSourceId)?.name ||
            'Pilih Supplier'
        );
    };

    const getWarehouseLabel = () => {
        if (!selectedSourceId) return 'Pilih Gudang...';
        return (
            warehouses.find((w) => w.id.toString() === selectedSourceId)
                ?.name || 'Pilih Gudang...'
        );
    };

    const restrictedWarehouseIds =
        locations.length === 1 ? [locations[0].id.toString()] : [];

    return (
        <div className="flex flex-col h-full">
            <div className="p-3 border-b flex-shrink-0 bg-background z-10">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-semibold">
                        Keranjang Pembelian
                    </h3>

                    {onClose && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 lg:hidden"
                            onClick={onClose}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>

                <Tabs
                    value={sourceTab}
                    onValueChange={handleTabChange}
                    className="w-full"
                >
                    <TabsList className="grid w-full grid-cols-2 h-9 mb-3">
                        <TabsTrigger value="supplier" className="text-xs">
                            <Truck className="h-3 w-3 mr-1" />
                            Supplier
                        </TabsTrigger>
                        <TabsTrigger value="internal" className="text-xs">
                            <Building2 className="h-3 w-3 mr-1" />
                            Internal
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="supplier" className="mt-0 space-y-2">
                        <div className="flex gap-2 items-end">
                            <div className="flex-1 space-y-1">
                                <Label className="text-xs font-medium text-muted-foreground">
                                    Filter Produk
                                </Label>
                                <Popover
                                    open={supplierOpen}
                                    onOpenChange={setSupplierOpen}
                                >
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={supplierOpen}
                                            className="w-full justify-between h-9 text-xs"
                                        >
                                            {getSupplierLabel()}
                                            <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        className="w-[280px] p-0"
                                        align="start"
                                    >
                                        <Command>
                                            <CommandInput
                                                placeholder="Cari supplier..."
                                                className="h-9 text-xs"
                                            />
                                            <CommandList>
                                                <CommandEmpty>
                                                    Supplier tidak ditemukan.
                                                </CommandEmpty>
                                                <CommandGroup>
                                                    <CommandItem
                                                        value="Semua Supplier"
                                                        onSelect={() => {
                                                            setFilter(
                                                                'supplier_id',
                                                                'all'
                                                            );
                                                            onInternalSourceChange(
                                                                'all',
                                                                'supplier'
                                                            );
                                                            setSupplierOpen(
                                                                false
                                                            );
                                                        }}
                                                        className="text-xs"
                                                    >
                                                        <Check
                                                            className={cn(
                                                                'mr-2 h-3 w-3',
                                                                selectedSourceId ===
                                                                    'all'
                                                                    ? 'opacity-100'
                                                                    : 'opacity-0'
                                                            )}
                                                        />
                                                        Semua Supplier
                                                    </CommandItem>
                                                    <CommandItem
                                                        value="Supplier Umum"
                                                        onSelect={() => {
                                                            setFilter(
                                                                'supplier_id',
                                                                'null'
                                                            );
                                                            onInternalSourceChange(
                                                                'null',
                                                                'supplier'
                                                            );
                                                            setSupplierOpen(
                                                                false
                                                            );
                                                        }}
                                                        className="text-xs"
                                                    >
                                                        <Check
                                                            className={cn(
                                                                'mr-2 h-3 w-3',
                                                                selectedSourceId ===
                                                                    'null'
                                                                    ? 'opacity-100'
                                                                    : 'opacity-0'
                                                            )}
                                                        />
                                                        Supplier Umum
                                                    </CommandItem>
                                                    {suppliers.map(
                                                        (supplier) => (
                                                            <CommandItem
                                                                key={
                                                                    supplier.id
                                                                }
                                                                value={
                                                                    supplier.name
                                                                }
                                                                onSelect={() => {
                                                                    setFilter(
                                                                        'supplier_id',
                                                                        supplier.id.toString()
                                                                    );
                                                                    onInternalSourceChange(
                                                                        supplier.id.toString(),
                                                                        'supplier'
                                                                    );
                                                                    setSupplierOpen(
                                                                        false
                                                                    );
                                                                }}
                                                                className="text-xs"
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        'mr-2 h-3 w-3',
                                                                        selectedSourceId ===
                                                                            supplier.id.toString()
                                                                            ? 'opacity-100'
                                                                            : 'opacity-0'
                                                                    )}
                                                                />
                                                                {supplier.name}
                                                            </CommandItem>
                                                        )
                                                    )}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <QuickAddSupplierModal
                                onSuccess={(newSupplier) => {
                                    setFilter(
                                        'supplier_id',
                                        newSupplier.id.toString()
                                    );
                                    onInternalSourceChange(
                                        newSupplier.id.toString(),
                                        'supplier'
                                    );
                                }}
                            >
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
                    </TabsContent>

                    <TabsContent value="internal" className="mt-0 space-y-2">
                        <div className="space-y-1">
                            <Label className="text-xs font-medium text-muted-foreground">
                                Pilih Gudang Asal
                            </Label>
                            <Popover
                                open={warehouseOpen}
                                onOpenChange={setWarehouseOpen}
                            >
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={warehouseOpen}
                                        className="w-full justify-between h-9 text-xs"
                                    >
                                        {getWarehouseLabel()}
                                        <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                    className="w-[280px] p-0"
                                    align="start"
                                >
                                    <Command>
                                        <CommandInput
                                            placeholder="Cari gudang..."
                                            className="h-9 text-xs"
                                        />
                                        <CommandList>
                                            <CommandEmpty>
                                                Gudang tidak ditemukan.
                                            </CommandEmpty>
                                            <CommandGroup>
                                                {warehouses.map((warehouse) => {
                                                    const isDisabled =
                                                        restrictedWarehouseIds.includes(
                                                            warehouse.id.toString()
                                                        );
                                                    return (
                                                        <CommandItem
                                                            key={warehouse.id}
                                                            value={
                                                                warehouse.name
                                                            }
                                                            disabled={
                                                                isDisabled
                                                            }
                                                            onSelect={() => {
                                                                if (
                                                                    isDisabled
                                                                ) {
                                                                    return;
                                                                }
                                                                onInternalSourceChange(
                                                                    warehouse.id.toString(),
                                                                    'internal'
                                                                );
                                                                setWarehouseOpen(
                                                                    false
                                                                );
                                                            }}
                                                            className={cn(
                                                                'text-xs',
                                                                isDisabled &&
                                                                'opacity-50 cursor-not-allowed'
                                                            )}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    'mr-2 h-3 w-3',
                                                                    selectedSourceId ===
                                                                        warehouse.id.toString()
                                                                        ? 'opacity-100'
                                                                        : 'opacity-0'
                                                                )}
                                                            />
                                                            {warehouse.name}
                                                        </CommandItem>
                                                    );
                                                })}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            <div className="flex-1 overflow-y-auto">
                {!hasCartItems ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center h-full">
                        <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                            <ShoppingBag className="w-8 h-8 text-muted-foreground/40" />
                        </div>
                        <p className="text-sm font-semibold text-foreground mb-1">
                            Keranjang kosong
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Pilih produk untuk memulai
                        </p>
                    </div>
                ) : (
                    <div className="p-3 pb-4">
                        <PurchaseItemManager
                            cartGroups={cartGroups}
                            onRemoveItem={removeItem}
                            onRemoveSupplierGroup={removeSupplierGroup}
                            onUpdateItem={updateItem}
                            getItemQuantity={getItemQuantity}
                            getItemCost={getItemCost}
                            processingItem={processingItem}
                            processingGroup={processingGroup}
                            onCheckoutGroup={onCheckout}
                            canCheckout={canCheckout}
                            selectedSourceType={selectedSourceType}
                        />
                    </div>
                )}
            </div>

            {hasCartItems && (
                <div className="flex-shrink-0 border-t bg-card p-3">
                    <div className="bg-muted/30 px-3 py-2.5 rounded-lg">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-medium text-muted-foreground">
                                Grand Total
                            </p>
                            <p className="text-base font-bold text-foreground">
                                {formatCurrency(dynamicTotal)}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

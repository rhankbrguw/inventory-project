import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ShoppingBag, UserPlus, User, Building2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { cn } from '@/lib/utils';
import QuickAddCustomerModal from '@/components/QuickAddCustomerModal';
import SellItemManager from './SellItemManager';
import { useState } from 'react';

export default function SellCart({
    cart,
    customers,
    branches,
    customerTypes,
    selectedCustomerId,
    selectedBranchId,
    onCustomerChange,
    onBranchChange,
    removeItem,
    updateItem,
    processingItem,
    onCheckout,
    locationId,
    getItemQuantity,
    canCheckout = true,
    getProductPrice,
}) {
    const hasItems = cart.length > 0;
    const isCartDisabled =
        !locationId || processingItem !== null || !canCheckout;

    const [buyerTab, setBuyerTab] = useState('general');
    const [customerOpen, setCustomerOpen] = useState(false);
    const [branchOpen, setBranchOpen] = useState(false);

    const handleNewCustomer = (newCustomer) => {
        onCustomerChange(newCustomer.id.toString());
        onBranchChange(null);
        setBuyerTab('customer');
    };

    const dynamicTotalCartPrice = cart.reduce((total, item) => {
        const price = item.sell_price || item.product.price;
        const qty = parseFloat(item.quantity) || 0;
        return total + qty * parseFloat(price);
    }, 0);

    const handleTabChange = (value) => {
        setBuyerTab(value);
        if (value === 'general') {
            onCustomerChange(null);
            onBranchChange(null);
        } else if (value === 'customer') {
            onBranchChange(null);
        } else if (value === 'branch') {
            onCustomerChange(null);
        }
    };

    () => {
        if (buyerTab === 'general') return 'Pelanggan Umum';
        if (buyerTab === 'customer' && selectedCustomerId) {
            const customer = customers.find(
                (c) => c.id.toString() === selectedCustomerId
            );
            return customer?.name || 'Pilih Pelanggan';
        }
        if (buyerTab === 'branch' && selectedBranchId) {
            const branch = branches.find(
                (b) => b.id.toString() === selectedBranchId
            );
            return branch?.name || 'Pilih Cabang';
        }
        return buyerTab === 'customer' ? 'Pilih Pelanggan' : 'Pilih Cabang';
    };

    return (
        <div className="flex flex-col h-full">
            <div className="p-3 border-b flex-shrink-0">
                <h3 className="text-base font-semibold mb-3">
                    Keranjang Penjualan
                </h3>

                <Tabs
                    value={buyerTab}
                    onValueChange={handleTabChange}
                    className="w-full"
                >
                    <TabsList className="grid w-full grid-cols-3 h-9">
                        <TabsTrigger value="general" className="text-xs">
                            <User className="h-3 w-3 mr-1" />
                            Umum
                        </TabsTrigger>
                        <TabsTrigger value="customer" className="text-xs">
                            <User className="h-3 w-3 mr-1" />
                            Pelanggan
                        </TabsTrigger>
                        <TabsTrigger value="branch" className="text-xs">
                            <Building2 className="h-3 w-3 mr-1" />
                            Cabang
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="general" className="mt-3">
                        <div className="p-3 rounded-lg border bg-muted/30 text-center">
                            <p className="text-xs text-muted-foreground">
                                Penjualan Walk-in (Tanpa identitas)
                            </p>
                        </div>
                    </TabsContent>

                    <TabsContent value="customer" className="mt-3 space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground">
                            Pilih Pelanggan Terdaftar
                        </Label>
                        <div className="flex gap-2">
                            <Popover
                                open={customerOpen}
                                onOpenChange={setCustomerOpen}
                            >
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={customerOpen}
                                        className="w-full justify-between h-9 text-xs"
                                    >
                                        {selectedCustomerId
                                            ? customers.find(
                                                  (c) =>
                                                      c.id.toString() ===
                                                      selectedCustomerId
                                              )?.name
                                            : 'Cari pelanggan...'}
                                        <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                    className="w-full p-0"
                                    align="start"
                                >
                                    <Command>
                                        <CommandInput
                                            placeholder="Ketik nama pelanggan..."
                                            className="h-9 text-xs"
                                        />
                                        <CommandList>
                                            <CommandEmpty>
                                                Pelanggan tidak ditemukan.
                                            </CommandEmpty>
                                            <CommandGroup>
                                                {customers.map((customer) => (
                                                    <CommandItem
                                                        key={customer.id}
                                                        value={customer.name}
                                                        onSelect={() => {
                                                            onCustomerChange(
                                                                customer.id.toString()
                                                            );
                                                            setCustomerOpen(
                                                                false
                                                            );
                                                        }}
                                                        className="text-xs"
                                                    >
                                                        <Check
                                                            className={cn(
                                                                'mr-2 h-3 w-3',
                                                                selectedCustomerId ===
                                                                    customer.id.toString()
                                                                    ? 'opacity-100'
                                                                    : 'opacity-0'
                                                            )}
                                                        />
                                                        {customer.name}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
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
                    </TabsContent>

                    <TabsContent value="branch" className="mt-3 space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground">
                            Pilih Cabang Tujuan
                        </Label>
                        <Popover open={branchOpen} onOpenChange={setBranchOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={branchOpen}
                                    className="w-full justify-between h-9 text-xs"
                                >
                                    {selectedBranchId
                                        ? branches.find(
                                              (b) =>
                                                  b.id.toString() ===
                                                  selectedBranchId
                                          )?.name
                                        : 'Cari cabang...'}
                                    <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-full p-0"
                                align="start"
                            >
                                <Command>
                                    <CommandInput
                                        placeholder="Ketik nama cabang..."
                                        className="h-9 text-xs"
                                    />
                                    <CommandList>
                                        <CommandEmpty>
                                            Cabang tidak ditemukan.
                                        </CommandEmpty>
                                        <CommandGroup>
                                            {branches.map((branch) => (
                                                <CommandItem
                                                    key={branch.id}
                                                    value={branch.name}
                                                    onSelect={() => {
                                                        onBranchChange(
                                                            branch.id.toString()
                                                        );
                                                        setBranchOpen(false);
                                                    }}
                                                    className="text-xs"
                                                >
                                                    <Check
                                                        className={cn(
                                                            'mr-2 h-3 w-3',
                                                            selectedBranchId ===
                                                                branch.id.toString()
                                                                ? 'opacity-100'
                                                                : 'opacity-0'
                                                        )}
                                                    />
                                                    {branch.name}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </TabsContent>
                </Tabs>
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
                    <div className="p-3 pb-4">
                        <SellItemManager
                            cart={cart}
                            removeItem={removeItem}
                            updateItem={updateItem}
                            processingItem={processingItem}
                            getItemQuantity={getItemQuantity}
                            locationId={locationId}
                            getProductPrice={getProductPrice}
                        />
                    </div>
                )}
            </div>

            {hasItems && (
                <div className="flex-shrink-0 border-t">
                    <div className="bg-muted/30 px-3 py-2.5">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-medium text-muted-foreground">
                                Total Penjualan
                            </p>
                            <p className="text-base font-bold text-foreground">
                                {formatCurrency(dynamicTotalCartPrice)}
                            </p>
                        </div>
                    </div>
                    <div className="p-3">
                        <Button
                            type="button"
                            className="w-full h-10 font-semibold"
                            onClick={onCheckout}
                            disabled={isCartDisabled}
                        >
                            Checkout
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

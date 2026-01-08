import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ShoppingBag, UserPlus } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    SelectGroup,
    SelectLabel,
} from '@/components/ui/select';
import QuickAddCustomerModal from '@/components/QuickAddCustomerModal';
import SellItemManager from './SellItemManager';

export default function SellCart({
    cart,
    customers,
    customerTypes,
    selectedCustomerId,
    onCustomerChange,
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

    const handleNewCustomer = (newCustomer) => {
        onCustomerChange(newCustomer.id.toString());
    };

    const dynamicTotalCartPrice = cart.reduce((total, item) => {
        const price = item.sell_price || item.product.price;
        const qty = parseFloat(item.quantity) || 0;
        return total + qty * parseFloat(price);
    }, 0);

    const internalCustomers = customers.filter(c => c.type?.code === 'CBG');
    const generalCustomers = customers.filter(c => c.type?.code !== 'CBG');

    return (
        <div className="flex flex-col h-full">
            <div className="p-3 border-b flex-shrink-0">
                <h3 className="text-base font-semibold">Keranjang Penjualan</h3>
                <div className="mt-2 space-y-2">
                    <Label
                        htmlFor="customer_id"
                        className="text-xs font-medium text-muted-foreground"
                    >
                        Pelanggan
                    </Label>
                    <div className="flex gap-2">
                        <Select
                            value={selectedCustomerId || ''}
                            onValueChange={(value) =>
                                onCustomerChange(
                                    value === 'null' ? null : value
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

                                {generalCustomers.length > 0 && (
                                    <SelectGroup>
                                        <SelectLabel className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50">
                                            Pelanggan Terdaftar
                                        </SelectLabel>
                                        {generalCustomers.map((cust) => (
                                            <SelectItem
                                                key={cust.id}
                                                value={cust.id.toString()}
                                            >
                                                {cust.name}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                )}

                                {internalCustomers.length > 0 && (
                                    <SelectGroup>
                                        <SelectLabel className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50 mt-1">
                                            Internal Cabang
                                        </SelectLabel>
                                        {internalCustomers.map((cust) => (
                                            <SelectItem
                                                key={cust.id}
                                                value={cust.id.toString()}
                                            >
                                                {cust.name}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                )}
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

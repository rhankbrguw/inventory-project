import { Button } from '@/components/ui/button';
import { ShoppingBag } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import SellItemManager from './SellItemManager';
import { useState } from 'react';
import useTranslation from '@/hooks/useTranslation';
import SellCartSourceSelector from '../../Partials/SellCartSourceSelector';

export default function SellCart({
    cart, customers, branches, customerTypes, selectedCustomerId, selectedBranchId,
    onCustomerChange, onBranchChange, removeItem, updateItem, flushItemQuantity, processingItem, onCheckout,
    locationId, getItemQuantity, canCheckout = true, getProductPrice, buyerTab = 'general',
    onBuyerTabChange, isWarehouse = false, isInternalMissingBranch = false, isMissingCustomer = false,
}) {
    const { t } = useTranslation();
    const hasItems = cart.length > 0;
    const isCartDisabled = !locationId || processingItem !== null || !canCheckout || isInternalMissingBranch || isMissingCustomer;
    const [customerOpen, setCustomerOpen] = useState(false);
    const [branchOpen, setBranchOpen] = useState(false);

    const handleNewCustomer = (newCustomer) => {
        onCustomerChange(newCustomer.id.toString());
        onBranchChange(null);
        if (onBuyerTabChange) onBuyerTabChange('customer');
    };

    const dynamicTotalCartPrice = cart.reduce(
        (total, item) => total + (parseFloat(item.quantity) || 0) * parseFloat(item.sell_price || item.product.price),
        0
    );

    return (
        <div className="flex flex-col h-full">
            <div className="p-3 border-b flex-shrink-0">
                <h3 className="text-base font-semibold mb-3">{t('ui.sell_cart')}</h3>
                <SellCartSourceSelector
                    buyerTab={buyerTab} handleTabChange={onBuyerTabChange} customerOpen={customerOpen} setCustomerOpen={setCustomerOpen}
                    branchOpen={branchOpen} setBranchOpen={setBranchOpen} selectedCustomerId={selectedCustomerId} selectedBranchId={selectedBranchId}
                    customers={customers} branches={branches} customerTypes={customerTypes} handleNewCustomer={handleNewCustomer}
                    onCustomerChange={onCustomerChange} onBranchChange={onBranchChange} isWarehouse={isWarehouse} currentLocationId={locationId}
                />
            </div>
            <div className="flex-1 overflow-y-auto">
                {!hasItems ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center h-full">
                        <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                            <ShoppingBag className="w-8 h-8 text-muted-foreground/40" />
                        </div>
                        <p className="text-sm font-semibold text-foreground mb-1">{t('ui.empty_cart')}</p>
                        <p className="text-xs text-muted-foreground">{t('ui.empty_cart_desc')}</p>
                    </div>
                ) : (
                    <div className="p-3 pb-4">
                        <SellItemManager
                            cart={cart} removeItem={removeItem} updateItem={updateItem} flushItemQuantity={flushItemQuantity}
                            processingItem={processingItem} getItemQuantity={getItemQuantity} locationId={locationId} getProductPrice={getProductPrice}
                        />
                    </div>
                )}
            </div>
            {hasItems && (
                <div className="flex-shrink-0 border-t">
                    <div className="bg-muted/30 px-3 py-2.5 flex items-center justify-between">
                        <p className="text-xs font-medium text-muted-foreground">{t('ui.total_sales')}</p>
                        <p className="text-base font-bold text-foreground">{formatCurrency(dynamicTotalCartPrice)}</p>
                    </div>
                    <div className="p-3">
                        <Button type="button" className="w-full h-10 font-semibold" onClick={onCheckout} disabled={isCartDisabled}>
                            {isInternalMissingBranch ? t('ui.select_dest_branch_required') : isMissingCustomer ? t('ui.select_customer_required') : t('ui.checkout')}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

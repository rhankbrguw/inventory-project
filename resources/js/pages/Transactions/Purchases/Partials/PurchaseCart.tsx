import PurchaseItemManager from './PurchaseItemManager';
import { Button } from '@/components/ui/button';
import { ShoppingBag, X } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useState, useEffect } from 'react';
import useTranslation from '@/hooks/useTranslation';
import PurchaseCartSourceSelector from '../../Partials/PurchaseCartSourceSelector';

export default function PurchaseCart({
    processingGroup, removeItem, removeSupplierGroup, updateItem, getItemQuantity, getItemCost,
    processingItem, totalCartItems, suppliers, warehouses = [], locations = [], cartGroups,
    canCheckout = true, onInternalSourceChange, selectedSourceId, selectedSourceType, dynamicTotal,
    onCheckout, setFilter, onClose,
}: {
    processingGroup: any; removeItem: any; removeSupplierGroup: any; updateItem: any; getItemQuantity: any; getItemCost: any;
    processingItem: any; totalCartItems: any; suppliers: any; warehouses?: any[]; locations?: any[]; cartGroups: any;
    canCheckout?: boolean; onInternalSourceChange: any; selectedSourceId: any; selectedSourceType: any; dynamicTotal: any;
    onCheckout: any; setFilter: any; onClose?: any;
}) {
    const { t } = useTranslation();
    const hasCartItems = totalCartItems > 0;
    const [sourceTab, setSourceTab] = useState(selectedSourceType || 'supplier');
    const [supplierOpen, setSupplierOpen] = useState(false);
    const [warehouseOpen, setWarehouseOpen] = useState(false);

    useEffect(() => { setSourceTab(selectedSourceType); }, [selectedSourceType]);

    const handleTabChange = (value) => {
        if (value === 'supplier') onInternalSourceChange('all', 'supplier');
        else onInternalSourceChange(null, 'internal');
    };

    const getSupplierLabel = () => {
        if (!selectedSourceId || selectedSourceId === 'all') return t('ui.all_suppliers');
        if (selectedSourceId === 'null') return t('ui.general_supplier');
        return suppliers.find((s) => s.id.toString() === selectedSourceId)?.name || t('ui.select_supplier');
    };

    const getWarehouseLabel = () => {
        if (!selectedSourceId) return t('ui.select_warehouse');
        return warehouses.find((w) => w.id.toString() === selectedSourceId)?.name || t('ui.select_warehouse');
    };

    return (
        <div className="flex flex-col h-full">
            <div className="p-3 border-b flex-shrink-0 bg-background z-10">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-semibold">{t('ui.purchase_cart')}</h3>
                    {onClose && <Button variant="ghost" size="icon" className="h-8 w-8 lg:hidden" onClick={onClose}><X className="h-4 w-4" /></Button>}
                </div>
                <PurchaseCartSourceSelector
                    sourceTab={sourceTab} handleTabChange={handleTabChange} supplierOpen={supplierOpen} setSupplierOpen={setSupplierOpen}
                    warehouseOpen={warehouseOpen} setWarehouseOpen={setWarehouseOpen} getSupplierLabel={getSupplierLabel} getWarehouseLabel={getWarehouseLabel}
                    suppliers={suppliers} warehouses={warehouses} locations={locations} selectedSourceId={selectedSourceId} setFilter={setFilter} onInternalSourceChange={onInternalSourceChange}
                />
            </div>
            <div className="flex-1 overflow-y-auto">
                {!hasCartItems ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center h-full">
                        <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-3"><ShoppingBag className="w-8 h-8 text-muted-foreground/40" /></div>
                        <p className="text-sm font-semibold text-foreground mb-1">{t('ui.empty_cart')}</p>
                        <p className="text-xs text-muted-foreground">{t('ui.empty_cart_desc')}</p>
                    </div>
                ) : (
                    <div className="p-3 pb-4">
                        <PurchaseItemManager cartGroups={cartGroups} onRemoveItem={removeItem} onRemoveSupplierGroup={removeSupplierGroup} onUpdateItem={updateItem} getItemQuantity={getItemQuantity} getItemCost={getItemCost} processingItem={processingItem} processingGroup={processingGroup} onCheckoutGroup={onCheckout} canCheckout={canCheckout} selectedSourceType={selectedSourceType} />
                    </div>
                )}
            </div>
            {hasCartItems && (
                <div className="flex-shrink-0 border-t bg-card p-3">
                    <div className="bg-muted/30 px-3 py-2.5 rounded-lg flex items-center justify-between">
                        <p className="text-xs font-medium text-muted-foreground">{t('ui.grand_total')}</p>
                        <p className="text-base font-bold text-foreground">{formatCurrency(dynamicTotal)}</p>
                    </div>
                </div>
            )}
        </div>
    );
}

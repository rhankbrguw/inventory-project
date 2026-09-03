import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/lib/utils';
import { usePage } from '@inertiajs/react';
import useTranslation from '@/hooks/useTranslation';
import PurchaseCartItem from './PurchaseCartItem';

const cleanNumberString = (numStr) => {
    if (typeof numStr !== 'string') return String(numStr);
    return numStr.replace(/\./g, '').replace(/,/g, '.');
};

export default function PurchaseItemManager({
    cartGroups = {},
    onRemoveItem,
    onRemoveSupplierGroup,
    onUpdateItem,
    getItemQuantity,
    getItemCost,
    processingItem,
    processingGroup,
    onCheckoutGroup,
    canCheckout,
    selectedSourceType,
}) {
    const { t } = useTranslation();
    const { errors } = usePage().props;

    const LoadingSpinner = () => (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
    );

    if (!cartGroups || typeof cartGroups !== 'object') {
        return null;
    }

    return (
        <div className="space-y-3">
            {Object.entries(cartGroups).map(([supplierName, groupData]) => {
                if (!groupData || !groupData.items) return null;

                const totalGroupCost = groupData.items.reduce((sum, item) => {
                    const quantity =
                        parseFloat(cleanNumberString(getItemQuantity(item))) ||
                        0;
                    const cost = parseFloat(getItemCost(item)) || 0;
                    return sum + quantity * cost;
                }, 0);
                const isGroupProcessing =
                    processingGroup === groupData.supplier_id;

                return (
                    <div
                        key={groupData.supplier_id || 'general'}
                        className="rounded-lg border bg-card shadow-sm overflow-hidden"
                    >
                        <div className="flex items-center justify-between p-2.5 bg-muted/50 border-b">
                            <Label className="text-sm font-semibold text-foreground truncate flex-1 min-w-0">
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
                                className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0 -mr-2"
                            >
                                {isGroupProcessing ? (
                                    <LoadingSpinner />
                                ) : (
                                    <Trash2 className="h-3.5 w-3.5" />
                                )}
                            </Button>
                        </div>

                        <div className="p-2.5 space-y-2">
                            {groupData.items.map((item, index) => (
                                <PurchaseCartItem
                                    key={item.id}
                                    item={item}
                                    index={index}
                                    onRemoveItem={onRemoveItem}
                                    onUpdateItem={onUpdateItem}
                                    getItemQuantity={getItemQuantity}
                                    getItemCost={getItemCost}
                                    processingItem={processingItem}
                                    isGroupProcessing={isGroupProcessing}
                                    selectedSourceType={selectedSourceType}
                                    errors={errors}
                                />
                            ))}
                        </div>

                        <div className="p-2.5 border-t bg-muted/30 space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-muted-foreground font-semibold">
                                    {t('ui.subtotal')}
                                </span>
                                <span className="text-sm font-bold text-primary">
                                    {formatCurrency(totalGroupCost)}
                                </span>
                            </div>

                            <Button
                                type="button"
                                className="w-full h-9 text-xs font-semibold"
                                onClick={() => onCheckoutGroup(groupData)}
                                disabled={
                                    !canCheckout ||
                                    isGroupProcessing ||
                                    processingItem !== null
                                }
                            >
                                {selectedSourceType === 'internal'
                                    ? t('ui.process_request')
                                    : t('ui.process_purchase2')}
                            </Button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

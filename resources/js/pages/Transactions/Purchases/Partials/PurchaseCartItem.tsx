import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/lib/utils';
import CurrencyInput from '@/components/CurrencyInput';
import InputError from '@/components/InputError';
import useTranslation from '@/hooks/useTranslation';

const cleanNumberString = (numStr) => {
    if (typeof numStr !== 'string') return String(numStr);
    return numStr.replace(/\./g, '').replace(/,/g, '.');
};

const LoadingSpinner = () => (
    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
);

export default function PurchaseCartItem({
    item,
    index,
    onRemoveItem,
    onUpdateItem,
    getItemQuantity,
    getItemCost,
    processingItem,
    isGroupProcessing,
    selectedSourceType,
    errors,
}) {
    const { t } = useTranslation();
    const isItemProcessing = processingItem === item.id;
    const subtotal =
        (parseFloat(cleanNumberString(getItemQuantity(item))) || 0) *
        (parseFloat(getItemCost(item)) || 0);
    const qtyError = errors[`items.${index}.quantity`];
    const costError = errors[`items.${index}.cost_per_unit`];

    return (
        <div className="pb-2 border-b last:border-b-0 last:pb-0">
            <div className="flex items-center justify-between gap-2 mb-2">
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
                    onClick={() => onRemoveItem(item.id)}
                    disabled={isItemProcessing || isGroupProcessing}
                    className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0 -mr-2 -mt-2"
                >
                    {isItemProcessing ? (
                        <LoadingSpinner />
                    ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                    )}
                </Button>
            </div>

            <div className="flex items-start gap-2">
                <div className="flex-1 space-y-1">
                    <Label
                        htmlFor={`qty-${item.id}`}
                        className="text-[10px] font-medium"
                    >
                        {t('ui.quantity')}
                    </Label>
                    <Input
                        id={`qty-${item.id}`}
                        type="text"
                        inputMode="numeric"
                        placeholder="1"
                        value={getItemQuantity(item)}
                        onChange={(e) => {
                            const rawValue = e.target.value.replace(/\./g, '');
                            onUpdateItem(item, 'quantity', rawValue);
                        }}
                        onFocus={(e) => e.target.select()}
                        disabled={isItemProcessing || isGroupProcessing}
                        className="h-8 text-xs"
                        autoComplete="off"
                    />
                    <InputError message={qtyError} />
                </div>
                <div className="flex-1 space-y-1">
                    <Label
                        htmlFor={`cost-${item.id}`}
                        className="text-[10px] font-medium"
                    >
                        {t('ui.buy_price')}
                    </Label>
                    <CurrencyInput
                        id={`cost-${item.id}`}
                        value={getItemCost(item)}
                        onValueChange={(value) =>
                            onUpdateItem(item, 'cost_per_unit', value || '0')
                        }
                        disabled={
                            isItemProcessing ||
                            isGroupProcessing ||
                            selectedSourceType === 'internal'
                        }
                        className="h-8 text-xs"
                    />
                    <InputError message={costError} />
                </div>
            </div>
            <div className="text-right mt-1.5">
                <p className="text-xs font-bold text-primary">
                    {formatCurrency(subtotal)}
                </p>
            </div>
        </div>
    );
}

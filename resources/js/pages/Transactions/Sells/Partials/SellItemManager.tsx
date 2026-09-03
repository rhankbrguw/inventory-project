import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2 } from 'lucide-react';
import UnifiedBadge from '@/components/UnifiedBadge';
import { formatCurrency, formatNumber } from '@/lib/utils';
import StockAvailability from '@/components/StockAvailability';
import useTranslation from '@/hooks/useTranslation';

export default function SellItemManager({
    cart, removeItem, updateItem, processingItem, getItemQuantity, locationId, getProductPrice: _getProductPrice, ...rest
}: {
    cart: any; removeItem: any; updateItem: any; processingItem: any; getItemQuantity: any; locationId: any; getProductPrice?: any; [key: string]: unknown;
}) {
    const { t } = useTranslation();
    const LoadingSpinner = () => <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />;

    const getDisplayValue = (item: any) => {
        const quantityValue = getItemQuantity(item);
        if (quantityValue === '' || quantityValue === null || quantityValue === undefined) return '';
        if (typeof quantityValue === 'string' && quantityValue.endsWith(',')) return quantityValue;
        return formatNumber(quantityValue);
    };

    if (cart.length === 0) return null;

    return (
        <div className="space-y-3">
            {cart.map((item: any) => {
                const isItemProcessing = processingItem === item.id;
                const priceToUse = item.sell_price || item.product.price;
                const subtotal = Number(item.quantity) * Number(priceToUse || 0);

                return (
                    <div key={item.id} className="p-3 border rounded-lg bg-card space-y-3 shadow-sm transition-colors hover:bg-accent/5">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm leading-tight text-foreground">{item.product.name}</p>
                                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                    <p className="text-xs text-muted-foreground font-medium">{formatCurrency(priceToUse)}</p>
                                    {item.product.unit && <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium uppercase tracking-wide">{item.product.unit}</span>}
                                    {item.sales_channel && <UnifiedBadge text={item.sales_channel.name} code={item.sales_channel.name} />}
                                </div>
                            </div>
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(item.id)} disabled={isItemProcessing} className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0 -mr-2 -mt-2">
                                {isItemProcessing ? <LoadingSpinner /> : <Trash2 className="h-4 w-4" />}
                            </Button>
                        </div>
                        <div className="flex items-center justify-between gap-4 pt-1">
                            <div className="space-y-1.5">
                                <label htmlFor={`qty-${item.id}`} className="text-xs font-medium text-muted-foreground block">{t('ui.quantity')}</label>
                                <div className="w-24">
                                    <Input id={`qty-${item.id}`} type="text" inputMode="numeric" placeholder="1" value={getDisplayValue(item)} onChange={(e) => updateItem(item, e.target.value.replace(/\./g, ''))} onFocus={(e) => e.target.select()} disabled={isItemProcessing} className="h-9 text-center font-bold text-sm bg-background" autoComplete="off" />
                                </div>
                            </div>
                            <div className="space-y-1 text-right">
                                <p className="text-xs font-medium text-muted-foreground">{t('ui.subtotal')}</p>
                                <p className="text-base font-bold text-foreground">{formatCurrency(subtotal)}</p>
                            </div>
                        </div>
                        <div className="pt-1 border-t border-border/50">
                            <StockAvailability productId={item.product.id} locationId={locationId} unit={item.product.unit} />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

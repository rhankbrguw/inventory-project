import type * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency, formatNumber } from '@/lib/utils';
import UnifiedBadge from '@/components/UnifiedBadge';
import useTranslation from '@/hooks/useTranslation';

type SellItem = {
    product?: { name?: string; unit?: string; sku?: string };
    product_name?: string;
    unit?: string;
    quantity?: number;
    sell_price?: number;
    cost_per_unit?: number;
    price?: number;
    average_cost_per_unit?: number;
    margin?: number;
    total?: number;
    subtotal?: number;
    channel_name?: string;
};

type SellMobileCardProps = {
    item: SellItem;
};

export function SellMobileCard({ item }: SellMobileCardProps) {
    const { t } = useTranslation();
    const productName = item.product?.name || item.product_name || '-';
    const unit = item.product?.unit || item.unit;
    const sku = item.product?.sku;
    const quantity = Math.abs(item.quantity || 0);
    const sellPrice = item.sell_price || item.cost_per_unit || item.price || 0;
    const avgCost = item.average_cost_per_unit || 0;
    const margin = item.margin !== undefined ? item.margin : (sellPrice - avgCost) * quantity;
    const total = item.total || item.subtotal || quantity * sellPrice;

    return (
        <Card className="shadow-sm">
            <CardContent className="p-3 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm leading-tight">{productName}</p>
                        {unit && <p className="text-[10px] text-muted-foreground mt-0.5">{t('ui.unit')}: {unit}</p>}
                    </div>
                    {sku && <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{sku}</span>}
                </div>

                {item.channel_name && item.channel_name !== '-' && (
                    <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-muted-foreground">{t('ui.sales_channel_label')}:</span>
                        <UnifiedBadge text={item.channel_name} />
                    </div>
                )}

                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div><p className="text-muted-foreground">{t('ui.qty')}</p><p className="font-semibold">{formatNumber(quantity)} {unit || ''}</p></div>
                    <div><p className="text-muted-foreground">{t('ui.sell_price')}</p><p className="font-semibold">{formatCurrency(sellPrice)}</p></div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><p className="text-muted-foreground">{t('ui.cost_price')}</p><p className="font-medium">{formatCurrency(avgCost)}</p></div>
                    <div><p className="text-muted-foreground">{t('ui.margin')}</p><p className={`font-semibold ${margin > 0 ? 'text-success' : 'text-destructive'}`}>{formatCurrency(margin)}</p></div>
                </div>

                <div className="pt-2 border-t flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">{t('ui.total')}</span>
                    <span className="font-bold text-sm">{formatCurrency(total)}</span>
                </div>
            </CardContent>
        </Card>
    );
}

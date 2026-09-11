import type * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency, formatNumber } from '@/lib/utils';
import useTranslation from '@/hooks/useTranslation';

type PurchaseItem = {
    product?: { name?: string; unit?: string; sku?: string };
    quantity?: number;
    cost_per_unit?: number;
};

type PurchaseMobileCardProps = {
    item: PurchaseItem;
};

export function PurchaseMobileCard({ item }: PurchaseMobileCardProps) {
    const { t } = useTranslation();
    const productName = item.product?.name || t('ui.product_deleted');
    const unit = item.product?.unit;
    const sku = item.product?.sku;
    const quantity = item.quantity || 0;
    const costPerUnit = item.cost_per_unit || 0;

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

                <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                    <div><p className="text-muted-foreground">{t('ui.qty')}</p><p className="font-semibold">{formatNumber(quantity)} {unit || ''}</p></div>
                    <div><p className="text-muted-foreground">{t('ui.buy_price')}</p><p className="font-semibold">{formatCurrency(costPerUnit)}</p></div>
                    <div><p className="text-muted-foreground">{t('ui.subtotal')}</p><p className="font-bold">{formatCurrency(quantity * costPerUnit)}</p></div>
                </div>
            </CardContent>
        </Card>
    );
}

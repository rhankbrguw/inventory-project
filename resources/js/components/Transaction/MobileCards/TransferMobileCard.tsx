import { Card, CardContent } from '@/components/ui/card';
import { formatNumber } from '@/lib/utils';
import useTranslation from '@/hooks/useTranslation';

type TransferItem = {
    product?: { name?: string; unit?: string; sku?: string };
    quantity?: number;
};

type TransferMobileCardProps = {
    item: TransferItem;
};

export function TransferMobileCard({ item }: TransferMobileCardProps) {
    const { t } = useTranslation();
    const productName = item.product?.name || t('ui.product_deleted');
    const unit = item.product?.unit;
    const sku = item.product?.sku;
    const quantity = Math.abs(item.quantity || 0);

    return (
        <Card className="shadow-sm">
            <CardContent className="p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0"><p className="font-semibold text-sm leading-tight">{productName}</p></div>
                    {sku && <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{sku}</span>}
                </div>
                <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{t('ui.quantity')}</span>
                    <span className="font-bold">{formatNumber(quantity)} {unit || ''}</span>
                </div>
            </CardContent>
        </Card>
    );
}

import { useEffect } from 'react';
import { formatNumber, cn } from '@/lib/utils';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import useTranslation from '@/hooks/useTranslation';
import { useStockAvailability } from '@/hooks/useStockAvailability';

type StockAvailabilityProps = {
    productId?: number | string;
    locationId?: number | string;
    unit?: string;
    onStockLoaded?: (stock: number | null) => void;
};

export default function StockAvailability({ productId, locationId, unit, onStockLoaded }: StockAvailabilityProps) {
    const { t } = useTranslation();
    const { quantity: stock, loading } = useStockAvailability(productId, locationId);

    useEffect(() => {
        onStockLoaded?.(stock);
    }, [stock, onStockLoaded]);

    if (loading) {
        return (
            <p className="text-xs text-muted-foreground mt-1">{t('ui.loading_stock')}</p>
        );
    }

    if (stock !== null) {
        const isAvailable = stock > 0;
        return (
            <p
                className={cn(
                    'text-xs mt-1 flex items-center gap-1',
                    isAvailable ? 'text-muted-foreground' : 'text-destructive'
                )}
            >
                {isAvailable ? (
                    <CheckCircle2 size={12} />
                ) : (
                    <AlertCircle size={12} />
                )}
                {t('ui.stock_available')} {formatNumber(stock)} {unit}
            </p>
        );
    }

    return null;
}

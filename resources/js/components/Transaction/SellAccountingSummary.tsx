import { Separator } from '@/components/ui/separator';
import { formatCurrency, formatNumber, cn } from '@/lib/utils';
import useTranslation from '@/hooks/useTranslation';

type SellAccountingTotals = {
    totalSell?: number;
    totalCost?: number;
    totalMargin?: number;
};

type SellAccountingSummaryProps = {
    totals: SellAccountingTotals;
    sell?: {
        has_installments?: boolean;
        interest_amount?: number;
        installment_terms?: number;
        total_payable?: number;
    };
};

export default function SellAccountingSummary({ totals, sell }: SellAccountingSummaryProps) {
    const { t } = useTranslation();
    const totalSell = totals.totalSell || 0;
    const totalCost = totals.totalCost || 0;
    const totalMargin = totals.totalMargin || (totalSell - totalCost);
    const marginPct = totalSell > 0 ? (totalMargin / totalSell) * 100 : 0;

    return (
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pt-3 border-t">
            <div className="text-xs text-muted-foreground max-w-xs space-y-0.5">
                <p className="font-semibold text-foreground text-xs">{t('ui.financial_summary')}</p>
                <p className="text-[11px] leading-snug text-muted-foreground">
                    {t('ui.cogs_margin_auto_calculated')}
                </p>
            </div>

            <div className="w-full sm:w-72 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-muted-foreground">
                    <span>{t('ui.total_revenue')}</span>
                    <span className="font-semibold text-foreground font-mono">{formatCurrency(totalSell)}</span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                    <span>{t('ui.total_cost_hpp')}</span>
                    <span className="font-mono text-muted-foreground">-{formatCurrency(totalCost)}</span>
                </div>
                <Separator className="my-1" />
                <div className="flex items-center justify-between font-bold text-xs">
                    <span className="text-foreground flex items-center gap-1.5">
                        {t('ui.net_profit')}
                        <span className={cn('text-[10px] font-semibold px-1 py-0.2 rounded font-mono', totalMargin >= 0 ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive')}>
                            {formatNumber(marginPct)}%
                        </span>
                    </span>
                    <span className={cn('font-mono font-bold text-sm', totalMargin >= 0 ? 'text-success' : 'text-destructive')}>
                        {totalMargin >= 0 ? '+' : ''}{formatCurrency(totalMargin)}
                    </span>
                </div>
                {sell?.has_installments && (sell?.interest_amount ?? 0) > 0 && (
                    <div className="pt-1.5 border-t space-y-1 text-[11px]">
                        <div className="flex items-center justify-between text-muted-foreground">
                            <span>{t('ui.interest_amount')} ({sell.installment_terms}x)</span>
                            <span className="font-mono">+{formatCurrency(sell.interest_amount ?? 0)}</span>
                        </div>
                        <div className="flex items-center justify-between font-bold text-xs text-foreground">
                            <span>{t('ui.total_payable')}</span>
                            <span className="font-mono text-primary font-bold text-sm">{formatCurrency(sell.total_payable ?? 0)}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

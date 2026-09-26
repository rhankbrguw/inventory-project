import { cn, formatCurrency } from '@/lib/utils';
import useTranslation from '@/hooks/useTranslation';

type FinancialBreakdownProps = {
    totalPrice: number | string;
    hasInstallment: boolean;
    interestAmount: number | string;
    rate: number | string;
    terms: number | string;
    totalPayable: number | string;
    perInstallment: number | string;
};

export default function FinancialBreakdown({
    totalPrice,
    hasInstallment,
    interestAmount,
    rate,
    terms,
    totalPayable,
    perInstallment,
}: FinancialBreakdownProps) {
    const { t } = useTranslation();

    return (
        <div className={cn(
            'rounded-lg border p-3 space-y-1.5 text-xs transition-colors',
            hasInstallment && Number(interestAmount) > 0
                ? 'bg-warning/10 border-warning/30'
                : 'bg-muted/30'
        )}>
            <div className="flex justify-between">
                <span className="text-muted-foreground">{t('ui.principal')}</span>
                <span className="font-medium">{formatCurrency(Number(totalPrice))}</span>
            </div>
            {hasInstallment && (
                <>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">
                            {t('ui.interest_amount')}
                            {Number(rate) > 0 && (
                                <span className="ml-1 text-warning font-medium">
                                    ({rate}% × {terms}×)
                                </span>
                            )}
                        </span>
                        <span className={cn(
                            'font-medium',
                            Number(interestAmount) > 0
                                ? 'text-warning'
                                : 'text-muted-foreground'
                        )}>
                            {Number(interestAmount) > 0
                                ? `+${formatCurrency(Number(interestAmount))}`
                                : formatCurrency(0)}
                        </span>
                    </div>
                    <div className="flex justify-between border-t pt-1.5">
                        <span className="font-semibold text-foreground">{t('ui.total_payable')}</span>
                        <span className="font-bold text-foreground">{formatCurrency(Number(totalPayable))}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>{terms}× {t('ui.installment')}</span>
                        <span>≈ {formatCurrency(Number(perInstallment))} {t('ui.per_month')}</span>
                    </div>
                </>
            )}
            {!hasInstallment && (
                <div className="flex justify-between border-t pt-1.5">
                    <span className="font-semibold text-foreground">{t('ui.total_transaction')}</span>
                    <span className="font-bold text-foreground">{formatCurrency(Number(totalPrice))}</span>
                </div>
            )}
        </div>
    );
}

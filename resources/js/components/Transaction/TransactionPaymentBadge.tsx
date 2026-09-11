import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import useTranslation from '@/hooks/useTranslation';

type InstallmentItem = {
    is_paid?: boolean;
    status?: string;
};

type TransactionPaymentBadgeProps = {
    installmentTerms?: number | string | null;
    paymentStatus?: string | null;
    hasInstallments?: boolean;
    installments?: InstallmentItem[];
};

export default function TransactionPaymentBadge({
    installmentTerms,
    paymentStatus,
    hasInstallments,
    installments,
}: TransactionPaymentBadgeProps) {
    const { t } = useTranslation();

    const isInstallment = Boolean(hasInstallments || (installmentTerms && Number(installmentTerms) > 1));
    const paidCount = installments?.filter((item) => item.is_paid || item.status === 'paid').length ?? 0;
    const totalCount = installments?.length || Number(installmentTerms) || 1;
    const resolvedStatus = (installments && installments.length > 0)
        ? (paidCount === totalCount ? 'paid' : paidCount > 0 ? 'partial' : 'unpaid')
        : (paymentStatus === 'paid' ? 'paid' : paymentStatus === 'partial' ? 'partial' : 'unpaid');

    const isPaid = resolvedStatus === 'paid';
    const isPartial = resolvedStatus === 'partial';

    return (
        <Badge
            variant="outline"
            className={cn(
                'text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap inline-flex items-center gap-1.5 leading-none shadow-none transition-colors',
                isPaid && 'bg-success/10 text-success border-success/30',
                isPartial && 'bg-warning/10 text-warning border-warning/30',
                !isPaid && !isPartial && 'bg-destructive/10 text-destructive border-destructive/20'
            )}
        >
            <span
                className={cn(
                    'w-1.5 h-1.5 rounded-full flex-shrink-0',
                    isPaid && 'bg-success',
                    isPartial && 'bg-warning animate-pulse',
                    !isPaid && !isPartial && 'bg-destructive'
                )}
            />
            {isInstallment && (
                <>
                    <span>{t('ui.installment')} {Number(installmentTerms || totalCount)}x</span>
                    <span className="opacity-40">/</span>
                </>
            )}
            <span>{isPaid ? t('ui.status_paid') : isPartial ? t('ui.status_partial') : t('ui.status_unpaid')}</span>
        </Badge>
    );
}

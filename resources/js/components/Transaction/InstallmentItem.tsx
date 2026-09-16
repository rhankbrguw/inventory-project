import type * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreditCard, Lock, CheckCircle2 } from 'lucide-react';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import useTranslation from '@/hooks/useTranslation';

type InstallmentItemData = {
    id: number | string;
    installment_number: number;
    due_date: string;
    paid_date?: string | null;
    amount: string | number;
    is_paid: boolean;
    is_overdue: boolean;
};

type InstallmentItemProps = {
    installment: InstallmentItemData;
    canPay: boolean;
    isLocked?: boolean;
    isNextPayable?: boolean;
    priorUnpaidNumber?: number;
    openPayDialog: (installment: InstallmentItemData) => void;
};

export default function InstallmentItem({
    installment,
    canPay,
    isLocked = false,
    isNextPayable = false,
    priorUnpaidNumber,
    openPayDialog,
}: InstallmentItemProps) {
    const { t } = useTranslation();

    const getStatusBadge = (inst: InstallmentItemData) => {
        if (inst.is_paid) {
            return (
                <Badge className="text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap leading-none bg-success/10 text-success border-success/30">
                    <CheckCircle2 className="w-2.5 h-2.5 mr-1 inline" />
                    {t('ui.status_paid')}
                </Badge>
            );
        }
        if (isLocked) {
            return (
                <Badge variant="outline" className="text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap leading-none text-muted-foreground border-border gap-1">
                    <Lock className="w-2.5 h-2.5" />
                    {t('ui.status_locked')}
                </Badge>
            );
        }
        if (inst.is_overdue) {
            return (
                <Badge variant="destructive" className="text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap leading-none">
                    {t('ui.status_overdue')}
                </Badge>
            );
        }
        return (
            <Badge variant="secondary" className="text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap leading-none">
                {t('ui.status_unpaid')}
            </Badge>
        );
    };

    return (
        <div
            className={cn(
                'flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border gap-2.5 transition-all text-xs',
                installment.is_paid
                    ? 'bg-success/5 border-success/20'
                    : isLocked
                      ? 'bg-muted/15 border-dashed border-border opacity-75'
                      : installment.is_overdue
                        ? 'bg-destructive/5 border-destructive/30 shadow-xs'
                        : isNextPayable
                          ? 'bg-primary/[0.03] border-primary/40 shadow-xs'
                          : 'bg-card hover:bg-muted/30 border-border'
            )}
        >
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-w-0">
                <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="font-semibold text-foreground text-xs sm:text-sm">
                        #{installment.installment_number}
                    </span>
                    {getStatusBadge(installment)}
                </div>
                <div className="text-[11px] text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span>{t('ui.due_date')}: {formatDate(installment.due_date)}</span>
                    {installment.paid_date && (
                        <span className="text-success font-medium flex items-center gap-1">
                            <span className="hidden sm:inline opacity-40">·</span>
                            <span>{t('ui.paid_on')}: {formatDate(installment.paid_date)}</span>
                        </span>
                    )}
                    {isLocked && priorUnpaidNumber && (
                        <span className="text-muted-foreground/80 italic">
                            ({t('ui.pay_prior_first', { number: priorUnpaidNumber })})
                        </span>
                    )}
                </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
                <span className="font-bold text-foreground font-mono text-xs sm:text-sm">
                    {formatCurrency(installment.amount)}
                </span>
                {canPay && !installment.is_paid && (
                    isLocked ? (
                        <Button
                            size="sm"
                            variant="ghost"
                            disabled
                            className="h-7 text-xs px-2.5 gap-1.5 text-muted-foreground/70 bg-muted/40 cursor-not-allowed flex-shrink-0"
                        >
                            <Lock className="w-3 h-3" />
                            <span>{t('ui.status_locked')}</span>
                        </Button>
                    ) : (
                        <Button
                            size="sm"
                            className={cn(
                                'h-7 text-xs px-2.5 gap-1.5 font-medium flex-shrink-0 shadow-xs',
                                isNextPayable
                                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                                    : 'border-primary/40 text-primary hover:bg-primary/5'
                            )}
                            variant={isNextPayable ? 'default' : 'outline'}
                            onClick={() => openPayDialog(installment)}
                        >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>{t('ui.pay_installment')}</span>
                        </Button>
                    )
                )}
            </div>
        </div>
    );
}

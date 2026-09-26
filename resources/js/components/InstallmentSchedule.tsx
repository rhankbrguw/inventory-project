import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, cn } from '@/lib/utils';
import { Calendar, CheckCircle2 } from 'lucide-react';
import PayInstallmentDialog, { type PayingInstallment } from './Transaction/PayInstallmentDialog';
import InstallmentItem from './Transaction/InstallmentItem';
import useTranslation from '@/hooks/useTranslation';

export type Installment = {
    id: number | string;
    is_paid: boolean;
    is_overdue: boolean;
    installment_number: number;
    amount: string | number;
    paid_amount?: string | number | null;
    due_date: string;
    paid_date?: string | null;
};

type InstallmentScheduleProps = {
    installments: Installment[];
    paymentStatus?: string;
    canPay?: boolean;
};

export default function InstallmentSchedule({ installments, canPay = false }: InstallmentScheduleProps) {
    const { t } = useTranslation();
    const [payingInstallment, setPayingInstallment] = useState<PayingInstallment | null>(null);
    const [paidAmount, setPaidAmount] = useState('');
    const [paidDate, setPaidDate] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    if (!installments || installments.length === 0) return null;

    const totalTerms = installments.length;
    const paidCount = installments.filter((inst) => inst.is_paid).length;
    const isFullyPaid = paidCount === totalTerms;
    const firstUnpaid = installments.find((inst) => !inst.is_paid);
    const totalPaid = installments.reduce((sum, inst) => sum + Number.parseFloat(String(inst.paid_amount ?? 0)), 0);
    const totalScheduled = installments.reduce((sum, inst) => sum + Number.parseFloat(String(inst.amount)), 0);

    const openPayDialog = (installment: Installment) => {
        setPaidAmount(String(installment.amount));
        setPaidDate(new Date().toISOString().split('T')[0]);
        setPayingInstallment(installment);
    };

    const closePayDialog = () => {
        setPayingInstallment(null);
        setPaidAmount('');
        setPaidDate('');
    };

    const handlePaySubmit = () => {
        if (!payingInstallment) return;
        setIsProcessing(true);
        router.post(route('installments.pay', payingInstallment.id), { paid_amount: paidAmount, paid_date: paidDate }, {
            preserveScroll: true,
            onFinish: () => { setIsProcessing(false); closePayDialog(); },
        });
    };

    return (
        <>
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                            <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <div className="min-w-0">
                                <CardTitle className="text-sm leading-none">{t('ui.installment_schedule')}</CardTitle>
                                <p className="text-[11px] text-muted-foreground mt-1">
                                    <span className={cn('font-semibold', isFullyPaid ? 'text-success' : 'text-foreground')}>{paidCount}</span>
                                    {' / '}{totalTerms} {t('ui.installment_terms').toLowerCase() || 'cicilan'}
                                    {isFullyPaid && <CheckCircle2 className="w-3 h-3 text-success inline ml-1 mb-0.5" />}
                                </p>
                            </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                            <p className="text-xs font-semibold text-foreground leading-none">{formatCurrency(totalPaid)}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">/ {formatCurrency(totalScheduled)}</p>
                        </div>
                    </div>
                    <div className="mt-3">
                        <div className="flex gap-1">
                            {installments.map((inst, idx) => (
                                <div key={idx} className={cn('h-1.5 flex-1 rounded-full transition-all duration-500', inst.is_paid ? 'bg-success' : inst.is_overdue ? 'bg-destructive/50' : 'bg-muted')} />
                            ))}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-0">
                    <div className="space-y-2">
                        {installments.map((installment) => {
                            const isNextPayable = firstUnpaid && firstUnpaid.id === installment.id;
                            const isLocked = !installment.is_paid && !isNextPayable;

                            return (
                                <InstallmentItem
                                    key={String(installment.id)}
                                    installment={installment}
                                    canPay={canPay}
                                    isLocked={isLocked}
                                    isNextPayable={Boolean(isNextPayable)}
                                    priorUnpaidNumber={firstUnpaid?.installment_number}
                                    openPayDialog={openPayDialog}
                                />
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
            <PayInstallmentDialog
                payingInstallment={payingInstallment}
                closePayDialog={closePayDialog}
                paidAmount={paidAmount}
                setPaidAmount={setPaidAmount}
                paidDate={paidDate}
                setPaidDate={setPaidDate}
                isProcessing={isProcessing}
                handlePaySubmit={handlePaySubmit}
            />
        </>
    );
}

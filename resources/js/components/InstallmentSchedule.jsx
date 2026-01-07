import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { Calendar } from 'lucide-react';

export default function InstallmentSchedule({ installments, paymentStatus }) {
    if (!installments || installments.length === 0) {
        return null;
    }

    const getStatusIndicator = (installment) => {
        if (installment.is_paid) {
            return (
                <Badge className="h-5 text-[10px] px-1.5 bg-success/10 text-success border-success/20">
                    Lunas
                </Badge>
            );
        }
        if (installment.is_overdue) {
            return (
                <Badge variant="destructive" className="h-5 text-[10px] px-1.5">
                    Jatuh Tempo
                </Badge>
            );
        }
        return (
            <Badge variant="secondary" className="h-5 text-[10px] px-1.5">
                Belum Bayar
            </Badge>
        );
    };

    const totalPaid = installments.reduce(
        (sum, inst) => sum + parseFloat(inst.paid_amount || 0),
        0
    );
    const totalAmount = installments.reduce(
        (sum, inst) => sum + parseFloat(inst.amount),
        0
    );
    const paidCount = installments.filter((inst) => inst.is_paid).length;
    const progressPercentage = (totalPaid / totalAmount) * 100;

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                        <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <div className="min-w-0">
                            <CardTitle className="text-sm leading-none">
                                Jadwal Cicilan
                            </CardTitle>
                            <p className="text-[11px] text-muted-foreground mt-1">
                                {paidCount} / {installments.length} terbayar
                            </p>
                        </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                        <p className="text-xs font-semibold text-foreground leading-none">
                            {formatCurrency(totalPaid)}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                            dari {formatCurrency(totalAmount)}
                        </p>
                    </div>
                </div>

                <div className="mt-3">
                    <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                        <div
                            className={cn(
                                'h-full transition-all duration-500 rounded-full',
                                paymentStatus === 'paid'
                                    ? 'bg-[hsl(var(--success))]'
                                    : 'bg-primary'
                            )}
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-0">
                <div className="space-y-2">
                    {installments.map((installment) => (
                        <div
                            key={installment.id}
                            className={cn(
                                'flex items-center justify-between p-2.5 rounded-md border transition-colors text-xs',
                                installment.is_paid
                                    ? 'bg-success/5 border-success/20'
                                    : installment.is_overdue
                                      ? 'bg-destructive/5 border-destructive/20'
                                      : 'bg-card hover:bg-muted/30'
                            )}
                        >
                            <div className="flex-1 min-w-0 mr-3">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                    <span className="font-semibold text-foreground">
                                        #{installment.installment_number}
                                    </span>
                                    {getStatusIndicator(installment)}
                                </div>
                                <div className="text-[10px] text-muted-foreground">
                                    {formatDate(installment.due_date)}
                                    {installment.paid_date && (
                                        <span className="ml-1.5">
                                            •{' '}
                                            {formatDate(installment.paid_date)}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                                <div className="font-bold text-foreground">
                                    {formatCurrency(installment.amount)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

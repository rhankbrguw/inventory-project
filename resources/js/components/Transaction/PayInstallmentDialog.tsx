import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMidtransPayment } from '@/hooks/useMidtransPayment';
import { CreditCard, CheckCircle2, ShieldCheck, Landmark } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import useTranslation from '@/hooks/useTranslation';

export type PayingInstallment = {
    id: number | string;
    installment_number?: number | string;
    amount?: number | string;
};

type PayInstallmentDialogProps = {
    payingInstallment: PayingInstallment | null;
    closePayDialog: (open?: boolean) => void;
    paidAmount: string;
    setPaidAmount: React.Dispatch<React.SetStateAction<string>>;
    paidDate: string;
    setPaidDate: React.Dispatch<React.SetStateAction<string>>;
    isProcessing: boolean;
    handlePaySubmit: () => void;
};

export default function PayInstallmentDialog({
    payingInstallment, closePayDialog, paidAmount, setPaidAmount,
    paidDate, setPaidDate, isProcessing, handlePaySubmit,
}: PayInstallmentDialogProps) {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('gateway');
    const { payInstallment, loading: midtransLoading } = useMidtransPayment();

    const handleMidtransPay = () => {
        if (!payingInstallment) return;
        payInstallment(payingInstallment.id, closePayDialog);
    };

    return (
        <Dialog open={!!payingInstallment} onOpenChange={closePayDialog}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-primary" />
                        {t('ui.pay_installment_title')}
                    </DialogTitle>
                    <DialogDescription>
                        {t('ui.pay_installment_desc', { number: payingInstallment?.installment_number ?? '' })}
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 h-9">
                        <TabsTrigger value="gateway" className="text-xs gap-1.5"><CreditCard className="w-3.5 h-3.5" />{t('ui.pay_via_gateway')}</TabsTrigger>
                        <TabsTrigger value="manual" className="text-xs gap-1.5"><Landmark className="w-3.5 h-3.5" />{t('ui.manual_settlement')}</TabsTrigger>
                    </TabsList>

                    <TabsContent value="gateway" className="space-y-4 pt-3">
                        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3.5 text-center space-y-1.5">
                            <p className="text-xs text-muted-foreground">{t('ui.total_payable')}</p>
                            <p className="text-xl font-bold text-primary">{formatCurrency(Number(payingInstallment?.amount || 0))}</p>
                            <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground pt-1">
                                <ShieldCheck className="w-3.5 h-3.5 text-success" />
                                <span>QRIS · Virtual Account · E-Wallet · Card</span>
                            </div>
                        </div>

                        <Button type="button" onClick={handleMidtransPay} disabled={midtransLoading || isProcessing} className="w-full justify-center gap-2 font-semibold h-10 shadow-sm">
                            <CreditCard className="w-4 h-4" />
                            <span>{midtransLoading ? t('ui.processing') : t('ui.pay_online_midtrans')}</span>
                        </Button>
                    </TabsContent>

                    <TabsContent value="manual" className="space-y-3 pt-3">
                        <p className="text-[11px] text-muted-foreground bg-muted/50 p-2.5 rounded-md border border-border/50">{t('ui.offline_payment_desc')}</p>
                        <div className="space-y-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="paid_amount" className="text-xs">{t('ui.paid_amount')}</Label>
                                <Input id="paid_amount" type="number" min="0.01" step="0.01" placeholder="0" value={paidAmount} onChange={(e) => setPaidAmount(e.target.value)} className="h-9 text-xs" />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="paid_date" className="text-xs">{t('ui.paid_date')}</Label>
                                <Input id="paid_date" type="date" max={new Date().toISOString().split('T')[0]} value={paidDate} onChange={(e) => setPaidDate(e.target.value)} className="h-9 text-xs" />
                            </div>
                        </div>
                        <div className="pt-2">
                            <Button onClick={handlePaySubmit} disabled={isProcessing || midtransLoading || !paidAmount || !paidDate} variant="outline" className="w-full justify-center gap-2 h-9 text-xs border-success/30 text-success hover:bg-success/5 hover:text-success">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>{isProcessing ? t('ui.processing') : t('ui.mark_as_paid')}</span>
                            </Button>
                        </div>
                    </TabsContent>
                </Tabs>

                <DialogFooter className="pt-2">
                    <Button variant="ghost" size="sm" onClick={() => closePayDialog()} disabled={isProcessing || midtransLoading} className="text-xs">{t('ui.cancel')}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

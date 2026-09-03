import { useEffect, useMemo } from 'react';
import { useForm } from '@inertiajs/react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import DatePicker from '@/components/DatePicker';
import { Button } from '@/components/ui/button';
import FormField from '@/components/FormField';
import InputError from '@/components/InputError';
import InstallmentTermsSelect from '@/components/Transaction/InstallmentTermsSelect';
import FinancialBreakdown from '@/components/Transaction/FinancialBreakdown';
import { formatCurrency, getNormalizedDate } from '@/lib/utils';
import useTranslation from '@/hooks/useTranslation';

export default function SellCheckoutDialog({ isOpen, onOpenChange, cartItems, totalPrice, locationId, customerId, targetLocationId, salesChannelId, paymentMethods }) {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors, transform } = useForm({
        location_id: locationId || '', customer_id: customerId || null, target_location_id: targetLocationId || null,
        sales_channel_id: salesChannelId || null, transaction_date: getNormalizedDate(), notes: '',
        payment_method_type_id: '', installment_terms: '1', interest_rate: '0', items: [],
    });

    useEffect(() => {
        if (isOpen) {
            setData({
                ...data, location_id: locationId, customer_id: customerId, target_location_id: targetLocationId,
                sales_channel_id: salesChannelId, transaction_date: data.transaction_date || getNormalizedDate(),
                payment_method_type_id: paymentMethods[0]?.id.toString() || '', installment_terms: '1', interest_rate: '0',
                items: cartItems.map((i) => ({ product_id: i.product.id, quantity: i.quantity, sell_price: i.sell_price || i.product.price, sales_channel_id: i.sales_channel?.id || null })),
            });
        }
    }, [isOpen, cartItems, locationId, customerId, targetLocationId, salesChannelId]);

    const selectedMethod = paymentMethods.find((m) => m.id.toString() === data.payment_method_type_id?.toString());
    const isCash = selectedMethod?.code === 'TUN' || selectedMethod?.name?.toLowerCase() === 'tunai';
    const terms = isCash ? 1 : (parseInt(data.installment_terms) || 1);
    const hasInstallment = !isCash && terms > 1;
    const rate = parseFloat(data.interest_rate) || 0;
    const interestAmount = useMemo(() => hasInstallment ? Math.round(totalPrice * (rate / 100) * terms * 100) / 100 : 0, [totalPrice, rate, terms, hasInstallment]);
    const totalPayable = totalPrice + interestAmount;
    const perInstallment = hasInstallment ? Math.round((totalPayable / terms) * 100) / 100 : totalPayable;

    const submit = (e) => {
        e.preventDefault();
        transform((d) => ({ ...d, transaction_date: format(d.transaction_date, 'yyyy-MM-dd'), installment_terms: isCash ? 1 : parseInt(d.installment_terms), interest_rate: hasInstallment ? parseFloat(d.interest_rate) || 0 : 0 }));
        post(route('transactions.sells.store'), { onSuccess: () => onOpenChange(false) });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{t('ui.confirm_sales')}</DialogTitle>
                    <DialogDescription>{t('ui.complete_transaction_total')} <span className="font-bold text-primary">{formatCurrency(totalPrice)}</span></DialogDescription>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-3 max-h-[65vh] overflow-y-auto px-1">
                        <div className="grid grid-cols-2 gap-3">
                            <FormField label={t('ui.date')} error={errors.transaction_date}>
                                <DatePicker value={data.transaction_date} onSelect={(d) => setData('transaction_date', d)} className="h-9 text-xs [&>button]:h-9" />
                            </FormField>
                            <FormField label={t('ui.payment')} error={errors.payment_method_type_id}>
                                <Select value={data.payment_method_type_id} onValueChange={(v) => setData('payment_method_type_id', v)}>
                                    <SelectTrigger className="h-9 text-xs"><SelectValue placeholder={t('ui.payment_method')} /></SelectTrigger>
                                    <SelectContent>{paymentMethods.map((m) => <SelectItem key={m.id} value={m.id.toString()}>{m.name}</SelectItem>)}</SelectContent>
                                </Select>
                            </FormField>
                        </div>
                        <InstallmentTermsSelect formData={data} setFormData={setData} errors={errors} isCash={isCash} />
                        <FinancialBreakdown totalPrice={totalPrice} hasInstallment={hasInstallment} interestAmount={interestAmount} rate={rate} terms={terms} totalPayable={totalPayable} perInstallment={perInstallment} />
                        <FormField label={t('ui.notes')} htmlFor="s_notes" optional error={errors.notes}>
                            <Input id="s_notes" value={data.notes} onChange={(e) => setData('notes', e.target.value)} placeholder={t('ui.transaction_notes_placeholder')} className="h-9 text-xs" />
                        </FormField>
                        {errors.items && <InputError message={t('ui.cart_item_error')} />}
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={processing} className="h-9 text-xs">{t('ui.cancel')}</Button>
                        <Button type="submit" disabled={processing} className="h-9 text-xs">{processing ? t('ui.processing') : t('ui.complete')}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

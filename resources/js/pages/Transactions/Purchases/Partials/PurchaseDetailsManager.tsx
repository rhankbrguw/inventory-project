import { useForm } from '@inertiajs/react';
import { format } from 'date-fns';
import { useMemo } from 'react';
import FormField from '@/components/FormField';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import DatePicker from '@/components/DatePicker';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { getNormalizedDate } from '@/lib/utils';
import InstallmentTermsSelect from '@/components/Transaction/InstallmentTermsSelect';
import FinancialBreakdown from '@/components/Transaction/FinancialBreakdown';
import useTranslation from '@/hooks/useTranslation';

export default function PurchaseDetailsManager({ supplierId, fromLocationId, locations, suppliers, paymentMethods, cartItems, onClose }) {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors, transform } = useForm({
        location_id: '', supplier_id: supplierId, from_location_id: fromLocationId,
        transaction_date: getNormalizedDate(), notes: '', payment_method_type_id: '',
        installment_terms: '1', interest_rate: '0',
        items: cartItems.map((i) => ({ product_id: i.product.id, quantity: i.quantity, cost_per_unit: i.cost_per_unit })),
    });

    const isInternal = !!fromLocationId;
    const selectedMethod = paymentMethods.find((m) => m.id.toString() === data.payment_method_type_id?.toString());
    const isCash = selectedMethod?.code === 'TUN' || selectedMethod?.name?.toLowerCase() === 'tunai';
    const terms = isCash ? 1 : (parseInt(data.installment_terms) || 1);
    const hasInstallment = !isCash && terms > 1;
    const rate = parseFloat(data.interest_rate) || 0;
    const principal = useMemo(() => cartItems.reduce((sum, item) => sum + item.quantity * item.cost_per_unit, 0), [cartItems]);
    const interestAmount = hasInstallment ? Math.round(principal * (rate / 100) * terms * 100) / 100 : 0;
    const totalPayable = principal + interestAmount;
    const perInstallment = hasInstallment ? Math.round((totalPayable / terms) * 100) / 100 : totalPayable;

    const getSourceName = () => {
        if (isInternal) return t('ui.central_warehouse');
        if (!supplierId || supplierId === 'null') return t('ui.general_supplier');
        return suppliers.find((s) => s.id === supplierId || s.id.toString() === supplierId)?.name || t('ui.general_supplier');
    };

    const submit = (e) => {
        e.preventDefault();
        transform((d) => ({ ...d, transaction_date: format(d.transaction_date, 'yyyy-MM-dd'), installment_terms: isCash ? 1 : parseInt(d.installment_terms), interest_rate: hasInstallment ? parseFloat(d.interest_rate) || 0 : 0 }));
        post(route('transactions.purchases.store'), { onSuccess: () => onClose() });
    };

    return (
        <form onSubmit={submit} className="space-y-4">
            <div className="space-y-3 max-h-[65vh] overflow-y-auto px-1">
                <FormField label={isInternal ? t('ui.stock_source') : t('ui.supplier_label')} htmlFor="source_display">
                    <Input id="source_display" value={getSourceName()} readOnly disabled className="h-9 text-xs bg-muted/50 cursor-not-allowed" />
                </FormField>
                <FormField label={isInternal ? t('ui.destination_branch') : t('ui.receiving_location')} htmlFor="location_id" error={errors.location_id}>
                    <Select value={data.location_id} onValueChange={(v) => setData('location_id', v)}>
                        <SelectTrigger id="location_id" className="h-9 text-xs"><SelectValue placeholder={t('ui.select_location')} /></SelectTrigger>
                        <SelectContent>{locations.map((loc) => <SelectItem key={loc.id} value={loc.id.toString()}>{loc.name}</SelectItem>)}</SelectContent>
                    </Select>
                </FormField>
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
                <FinancialBreakdown totalPrice={principal} hasInstallment={hasInstallment} interestAmount={interestAmount} rate={rate} terms={terms} totalPayable={totalPayable} perInstallment={perInstallment} />
                <FormField label={t('ui.notes')} htmlFor="notes" optional error={errors.notes}>
                    <Input id="notes" value={data.notes} onChange={(e) => setData('notes', e.target.value)} placeholder={t('ui.transaction_notes_placeholder')} className="h-9 text-xs" />
                </FormField>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
                <Button type="button" variant="outline" onClick={onClose} disabled={processing} className="h-9 text-xs">{t('ui.cancel')}</Button>
                <Button type="submit" disabled={processing} className="h-9 text-xs">{processing ? t('ui.processing') : t('ui.complete')}</Button>
            </DialogFooter>
        </form>
    );
}

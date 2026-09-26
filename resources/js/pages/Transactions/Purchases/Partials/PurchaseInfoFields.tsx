import UnifiedBadge from '@/components/UnifiedBadge';
import TransactionPaymentBadge from '@/components/Transaction/TransactionPaymentBadge';
import { formatDate, formatCurrency } from '@/lib/utils';

export function buildPurchaseInfoFields(data, t) {
    const getSourceDisplay = () => {
        if (data.is_internal && data.from_location) return <span className="font-semibold text-primary">{data.from_location.name} (Internal)</span>;
        if (data.supplier) return data.supplier.name;
        return t('ui.general_supplier');
    };

    return [
        { label: t('ui.receiving_location'), value: data.location.name },
        { label: t('ui.source_supplier'), value: getSourceDisplay() },
        { label: t('ui.transaction_date'), value: formatDate(data.transaction_date) },
        { label: t('ui.status'), value: <UnifiedBadge text={data.status} code={data.status} /> },
        {
            label: t('ui.payment'),
            value: (
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    {data.payment_method?.name && (
                        <span className="font-semibold text-foreground text-xs sm:text-sm">{data.payment_method.name}</span>
                    )}
                    <TransactionPaymentBadge
                        installmentTerms={data.installment_terms}
                        paymentStatus={data.payment_status}
                        hasInstallments={data.has_installments}
                        installments={data.installments}
                    />
                </div>
            ),
        },
        { label: t('ui.pic'), value: data.user.name },
        {
            label: t('ui.total_payable'),
            value: data.interest_amount > 0 ? `${formatCurrency(data.total_payable)} (+${formatCurrency(data.interest_amount)} ${t('ui.interest_amount').toLowerCase()})` : formatCurrency(data.total_cost),
            hidden: !data.has_installments,
        },
        { label: t('ui.approved_by'), value: data.approved_by?.name, hidden: !data.approved_by },
        { label: t('ui.rejected_by'), value: data.rejected_by?.name, hidden: !data.rejected_by },
        { label: t('ui.rejection_reason'), value: <span className="text-destructive font-medium">{data.rejection_reason}</span>, hidden: !data.rejection_reason, span: 'full' },
        { label: t('ui.notes'), value: data.notes, span: 'full', hidden: !data.notes },
        {
            label: t('ui.proof_of_delivery'),
            value: (data.receipt_photo_url || data.receipt_photo_path) ? (
                <div className="mt-2 inline-block max-w-sm rounded-lg overflow-hidden border border-border shadow-xs bg-muted">
                    <img src={data.receipt_photo_url || `/storage/${data.receipt_photo_path}`} alt={t('ui.proof_of_delivery')} className="rounded-lg max-h-64 w-full object-cover" />
                </div>
            ) : null,
            span: 'full',
            hidden: !data.receipt_photo_url && !data.receipt_photo_path,
        },
    ];
}

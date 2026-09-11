import { Badge } from '@/components/ui/badge';
import UnifiedBadge from '@/components/UnifiedBadge';
import TransactionPaymentBadge from '@/components/Transaction/TransactionPaymentBadge';
import { formatDate, formatCurrency } from '@/lib/utils';

export function buildSellInfoFields(data, t) {
    const getBuyerDisplay = () => {
        if (data.target_location) return `${data.target_location.name} (${t('ui.internal_label')})`;
        if (data.customer) return data.customer.name;
        return t('ui.general_customer');
    };

    return [
        { label: t('ui.sales_location'), value: data.location?.name },
        { label: t('ui.buyer'), value: getBuyerDisplay() },
        { label: t('ui.transaction_date'), value: formatDate(data.transaction_date) },
        {
            label: t('ui.sales_channel'),
            value: data.sales_channel ? (
                <span className="flex items-center gap-2">
                    <span className="font-semibold">{data.sales_channel.name}</span>
                    <Badge variant="outline" className="text-[10px] font-mono">{data.sales_channel.code}</Badge>
                </span>
            ) : null,
            hidden: !data.sales_channel,
        },
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
        { label: t('ui.pic'), value: data.user?.name },
        {
            label: t('ui.total_payable'),
            value: data.interest_amount > 0 ? `${formatCurrency(data.total_payable)} (+${formatCurrency(data.interest_amount)} ${t('ui.interest_amount').toLowerCase()})` : formatCurrency(data.total_price),
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

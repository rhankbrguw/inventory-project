import ContentPageLayout from '@/components/ContentPageLayout';
import InstallmentSchedule from '@/components/InstallmentSchedule';
import TransactionInfoGrid from '@/components/Transaction/TransactionInfoGrid';
import TransactionPaymentBadge from '@/components/Transaction/TransactionPaymentBadge';
import TransactionItemsSection from '@/components/Transaction/TransactionItemsSection';
import { purchaseDetailColumns } from '@/constants/tableColumns';
import UnifiedBadge from '@/components/UnifiedBadge';
import { formatDate } from '@/lib/utils';

export default function Show({ auth, purchase }) {
    const { data } = purchase;

    const infoFields = [
        {
            label: 'Lokasi Penerima',
            value: data.location.name,
        },
        {
            label: 'Sumber / Supplier',
            value: data.supplier ? (
                data.supplier.name
            ) : data.notes && data.notes.includes('Internal Transfer') ? (
                <span className="font-semibold text-blue-600">
                    Internal Transfer (Pusat)
                </span>
            ) : (
                'Supplier Umum'
            ),
        },
        {
            label: 'Tanggal Transaksi',
            value: formatDate(data.transaction_date),
        },
        {
            label: 'Status',
            value: <UnifiedBadge text={data.status} code={data.status} />,
        },
        {
            label: 'Pembayaran',
            value: null,
            badge: (
                <TransactionPaymentBadge
                    installmentTerms={data.installment_terms}
                    paymentStatus={data.payment_status}
                    hasInstallments={data.has_installments}
                />
            ),
        },
        {
            label: 'PIC',
            value: data.user.name,
        },
        {
            label: 'Catatan',
            value: data.notes,
            span: 'full',
            hidden: !data.notes,
        },
    ];

    return (
        <ContentPageLayout
            auth={auth}
            title="Detail Transaksi"
            backRoute="transactions.index"
        >
            <TransactionInfoGrid
                title="Informasi Umum"
                subtitle={data.reference_code}
                fields={infoFields}
            />

            {data.has_installments && (
                <InstallmentSchedule
                    installments={data.installments}
                    paymentStatus={data.payment_status}
                />
            )}

            <TransactionItemsSection
                type="purchase"
                items={data.items}
                columns={purchaseDetailColumns}
                totalLabel="Total Pembelian"
                totalAmount={data.total_cost}
            />
        </ContentPageLayout>
    );
}

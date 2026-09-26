import ContentPageLayout from '@/components/ContentPageLayout';
import InstallmentSchedule from '@/components/InstallmentSchedule';
import TransactionInfoGrid from '@/components/Transaction/TransactionInfoGrid';
import TransactionItemsSection from '@/components/Transaction/TransactionItemsSection';
import TransactionActionDialogs from '@/components/Transaction/TransactionActionDialogs';
import { PendingApprovalCard, ReadyToShipCard, InShippingCard } from '@/components/Transaction/TransactionStatusCards';
import useTransactionActions from '@/hooks/useTransactionActions';
import { useMidtransPayment } from '@/hooks/useMidtransPayment';
import { sellDetailColumns } from '@/constants/tableColumns/sellDetailColumns';
import { Button } from '@/components/ui/button';
import { QrCode } from 'lucide-react';
import useTranslation from '@/hooks/useTranslation';
import { buildSellInfoFields } from './Partials/SellInfoFields';

export default function Show({ auth, sell, canShip, canReceive, canApprove, canPay = false, isPaymentSufficient = true }) {
    const { data } = sell;
    const { t } = useTranslation();
    const { paySell, loading: midtransLoading } = useMidtransPayment();

    const {
        isShipDialogOpen, setIsShipDialogOpen, isReceiveDialogOpen, setIsReceiveDialogOpen,
        isApproveDialogOpen, setIsApproveDialogOpen, isRejectDialogOpen, setIsRejectDialogOpen,
        rejectionReason, setRejectionReason, isProcessing,
        handleApproveConfirm, handleRejectConfirm, handleShipConfirm, handleReceiveConfirm,
    } = useTransactionActions('sell', data.id);

    const infoFields = buildSellInfoFields(data, t);
    const isUnpaid = data.payment_status !== 'paid' && data.is_fully_paid === false;

    const actionButton = (canPay && isUnpaid && !data.has_installments) ? (
        <Button size="sm" onClick={() => paySell(data.id)} disabled={midtransLoading} className="gap-2 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold shadow-sm">
            <QrCode className="w-4 h-4" />
            <span>{midtransLoading ? t('ui.processing') : t('ui.customer_payment_qr')}</span>
        </Button>
    ) : null;

    return (
        <ContentPageLayout auth={auth} title={t('ui.transaction_detail')} backRoute="transactions.index" action={actionButton}>
            {data.status === 'Pending Approval' && <PendingApprovalCard description={t('ui.pending_approval_sell_desc')} canApprove={canApprove} isProcessing={isProcessing} onReject={() => setIsRejectDialogOpen(true)} onApprove={() => setIsApproveDialogOpen(true)} />}
            {data.status === 'On Process' && <ReadyToShipCard description={t('ui.ready_to_ship_sell_desc')} canShip={canShip} isProcessing={isProcessing} onShip={() => setIsShipDialogOpen(true)} isPaymentSufficient={isPaymentSufficient} />}
            {data.status === 'Shipping' && <InShippingCard description={t('ui.in_shipping_sell_desc')} canReceive={canReceive} isProcessing={isProcessing} onReceive={() => setIsReceiveDialogOpen(true)} />}

            <TransactionInfoGrid title={t('ui.general_information')} subtitle={data.reference_code} fields={infoFields} />
            {data.has_installments && <InstallmentSchedule installments={data.installments} paymentStatus={data.payment_status} canPay={canPay && data.is_fully_paid === false} />}

            <TransactionItemsSection type="sell" items={data.items} columns={sellDetailColumns(t)} totals={data.totals} totalAmount={data.total_price} sell={data} />

            <TransactionActionDialogs
                type="sell" isApproveDialogOpen={isApproveDialogOpen} setIsApproveDialogOpen={setIsApproveDialogOpen}
                isRejectDialogOpen={isRejectDialogOpen} setIsRejectDialogOpen={setIsRejectDialogOpen}
                isShipDialogOpen={isShipDialogOpen} setIsShipDialogOpen={setIsShipDialogOpen}
                isReceiveDialogOpen={isReceiveDialogOpen} setIsReceiveDialogOpen={setIsReceiveDialogOpen}
                rejectionReason={rejectionReason} setRejectionReason={setRejectionReason} isProcessing={isProcessing}
                handleApproveConfirm={handleApproveConfirm} handleRejectConfirm={handleRejectConfirm}
                handleShipConfirm={handleShipConfirm} handleReceiveConfirm={handleReceiveConfirm}
            />
        </ContentPageLayout>
    );
}

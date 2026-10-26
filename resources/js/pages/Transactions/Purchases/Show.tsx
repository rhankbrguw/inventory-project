import ContentPageLayout from '@/components/ContentPageLayout';
import InstallmentSchedule from '@/components/InstallmentSchedule';
import TransactionInfoGrid from '@/components/Transaction/TransactionInfoGrid';
import TransactionItemsSection from '@/components/Transaction/TransactionItemsSection';
import TransactionActionDialogs from '@/components/Transaction/TransactionActionDialogs';
import { PendingApprovalCard, ReadyToShipCard, InShippingCard } from '@/components/Transaction/TransactionStatusCards';
import useTransactionActions from '@/hooks/useTransactionActions';
import { useMidtransPayment } from '@/hooks/useMidtransPayment';
import { purchaseDetailColumns } from '@/constants/tableColumns/purchaseDetailColumns';
import { Button } from '@/components/ui/button';
import { CreditCard } from 'lucide-react';
import useTranslation from '@/hooks/useTranslation';
import { buildPurchaseInfoFields } from './Partials/PurchaseInfoFields';

export default function Show({ auth, purchase, canApprove, canShip, canReceive, canPay = false, isPaymentSufficient = true }) {
    const { data } = purchase;
    const { t } = useTranslation();
    const { payPurchase, loading: midtransLoading } = useMidtransPayment();

    const {
        isShipDialogOpen, setIsShipDialogOpen, isReceiveDialogOpen, setIsReceiveDialogOpen,
        isApproveDialogOpen, setIsApproveDialogOpen, isRejectDialogOpen, setIsRejectDialogOpen,
        rejectionReason, setRejectionReason, isProcessing,
        handleApproveConfirm, handleRejectConfirm, handleShipConfirm, handleReceiveConfirm,
    } = useTransactionActions('purchase', data.id);

    const infoFields = buildPurchaseInfoFields(data, t);
    const isUnpaid = data.payment_status !== 'paid' && data.is_fully_paid === false;

    const actionButton = (canPay && isUnpaid && !data.has_installments) ? (
        <Button size="sm" onClick={() => payPurchase(data.id)} disabled={midtransLoading} className="gap-2 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold shadow-sm">
            <CreditCard className="w-4 h-4" />
            <span>{midtransLoading ? t('ui.processing') : t('ui.pay_supplier_bill')}</span>
        </Button>
    ) : null;

    return (
        <ContentPageLayout auth={auth} title={t('ui.transaction_detail')} backRoute="transactions.index" action={actionButton}>
            {data.status === 'Pending Approval' && <PendingApprovalCard description={t('ui.pending_approval_purchase_desc')} canApprove={canApprove} isProcessing={isProcessing} onReject={() => setIsRejectDialogOpen(true)} onApprove={() => setIsApproveDialogOpen(true)} />}
            {data.status === 'On Process' && <ReadyToShipCard description={t('ui.ready_to_ship_purchase_desc')} canShip={canShip} isProcessing={isProcessing} onShip={() => setIsShipDialogOpen(true)} isPaymentSufficient={isPaymentSufficient} />}
            {data.status === 'Shipping' && <InShippingCard description={t('ui.in_shipping_purchase_desc')} canReceive={canReceive} isProcessing={isProcessing} onReceive={() => setIsReceiveDialogOpen(true)} />}

            <TransactionInfoGrid title={t('ui.general_information')} subtitle={data.reference_code} fields={infoFields} />
            {data.has_installments && <InstallmentSchedule installments={data.installments} paymentStatus={data.payment_status} canPay={canPay && data.is_fully_paid === false} />}

            <TransactionItemsSection type="purchase" items={data.items} columns={purchaseDetailColumns(t)} totalLabel={t('ui.total_purchase')} totalAmount={data.total_cost} transaction={data} />

            <TransactionActionDialogs
                type="purchase" isApproveDialogOpen={isApproveDialogOpen} setIsApproveDialogOpen={setIsApproveDialogOpen}
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

import ContentPageLayout from '@/components/ContentPageLayout';
import TransactionInfoGrid from '@/components/Transaction/TransactionInfoGrid';
import TransactionItemsSection from '@/components/Transaction/TransactionItemsSection';
import TransactionActionDialogs from '@/components/Transaction/TransactionActionDialogs';
import { transferDetailColumns } from '@/constants/tableColumns/transferDetailColumns';
import useTranslation from '@/hooks/useTranslation';
import { PendingApprovalCard, ReadyToShipCard, InShippingCard } from '@/components/Transaction/TransactionStatusCards';
import useTransactionActions from '@/hooks/useTransactionActions';
import { buildTransferInfoFields } from './Partials/TransferInfoFields';

export default function Show({ auth, transfer, canApprove, canShip, canReceive }) {
    const { data } = transfer;
    const { t } = useTranslation();

    const {
        isShipDialogOpen, setIsShipDialogOpen, isReceiveDialogOpen, setIsReceiveDialogOpen,
        isApproveDialogOpen, setIsApproveDialogOpen, isRejectDialogOpen, setIsRejectDialogOpen,
        rejectionReason, setRejectionReason, isProcessing,
        handleApproveConfirm, handleRejectConfirm, handleShipConfirm, handleReceiveConfirm,
    } = useTransactionActions('transfer', data.id);

    const infoFields = buildTransferInfoFields(data, t);

    return (
        <ContentPageLayout auth={auth} title={t('ui.transfer_detail')} backRoute="transactions.index">
            {data.status === 'Pending Approval' && <PendingApprovalCard description={t('ui.pending_approval_transfer_desc')} canApprove={canApprove} isProcessing={isProcessing} onReject={() => setIsRejectDialogOpen(true)} onApprove={() => setIsApproveDialogOpen(true)} />}
            {data.status === 'On Process' && <ReadyToShipCard description={t('ui.ready_to_ship_transfer_desc')} canShip={canShip} isProcessing={isProcessing} onShip={() => setIsShipDialogOpen(true)} />}
            {data.status === 'Shipping' && <InShippingCard description={t('ui.in_shipping_transfer_desc')} canReceive={canReceive} isProcessing={isProcessing} onReceive={() => setIsReceiveDialogOpen(true)} />}

            <TransactionInfoGrid title={t('ui.transfer_info')} subtitle={data.reference_code} fields={infoFields} />
            <TransactionItemsSection type="transfer" items={data.items} columns={transferDetailColumns(t)} />

            <TransactionActionDialogs
                type="transfer" isApproveDialogOpen={isApproveDialogOpen} setIsApproveDialogOpen={setIsApproveDialogOpen}
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

import React from 'react';
import ApproveDialog from './ApproveDialog';
import RejectDialog from './RejectDialog';
import ShipDialog from './ShipDialog';
import ReceiveDialog from './ReceiveDialog';

type TransactionActionDialogType = 'order' | 'request' | 'transfer' | 'sell' | 'purchase';

type TransactionActionDialogsProps = {
    type?: TransactionActionDialogType;
    isApproveDialogOpen?: boolean;
    setIsApproveDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
    isRejectDialogOpen?: boolean;
    setIsRejectDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
    isShipDialogOpen?: boolean;
    setIsShipDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
    isReceiveDialogOpen?: boolean;
    setIsReceiveDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
    rejectionReason: string;
    setRejectionReason: React.Dispatch<React.SetStateAction<string>>;
    isProcessing: boolean;
    handleApproveConfirm: () => void;
    handleRejectConfirm: () => void;
    handleShipConfirm: () => void;
    handleReceiveConfirm: (file: File | null) => void;
};

const DIALOG_CONFIG: Record<string, { approve: string; reject: string; rejectBtn: string; shipDesc: string; receiveDesc: string }> = {
    sell: { approve: 'approve_order', reject: 'reject_order', rejectBtn: 'reject_order_btn', shipDesc: 'confirm_ship_sell_desc', receiveDesc: 'confirm_receive_sell_desc' },
    order: { approve: 'approve_order', reject: 'reject_order', rejectBtn: 'reject_order_btn', shipDesc: 'confirm_ship_sell_desc', receiveDesc: 'confirm_receive_sell_desc' },
    purchase: { approve: 'approve_request', reject: 'reject_request', rejectBtn: 'reject_request_btn', shipDesc: 'confirm_ship_purchase_desc', receiveDesc: 'confirm_receive_purchase_desc' },
    request: { approve: 'approve_request', reject: 'reject_request', rejectBtn: 'reject_request_btn', shipDesc: 'confirm_ship_purchase_desc', receiveDesc: 'confirm_receive_purchase_desc' },
    transfer: { approve: 'approve_transfer', reject: 'reject_transfer', rejectBtn: 'reject_transfer_btn', shipDesc: 'confirm_ship_transfer_desc', receiveDesc: 'confirm_receive_transfer_desc' },
};

const DEFAULT_DIALOG_CONFIG = { approve: 'approve', reject: 'reject', rejectBtn: 'reject_btn', shipDesc: 'confirm_ship_desc', receiveDesc: 'confirm_receive_desc' };

export default function TransactionActionDialogs({
    type = 'order',
    isApproveDialogOpen,
    setIsApproveDialogOpen,
    isRejectDialogOpen,
    setIsRejectDialogOpen,
    isShipDialogOpen,
    setIsShipDialogOpen,
    isReceiveDialogOpen,
    setIsReceiveDialogOpen,
    rejectionReason,
    setRejectionReason,
    isProcessing,
    handleApproveConfirm,
    handleRejectConfirm,
    handleShipConfirm,
    handleReceiveConfirm,
}: TransactionActionDialogsProps) {
    const keys = DIALOG_CONFIG[type] ?? DEFAULT_DIALOG_CONFIG;

    return (
        <>
            {isApproveDialogOpen !== undefined && (
                <ApproveDialog
                    isOpen={isApproveDialogOpen}
                    setIsOpen={setIsApproveDialogOpen}
                    isProcessing={isProcessing}
                    confirmKey={keys.approve}
                    onConfirm={handleApproveConfirm}
                />
            )}

            {isRejectDialogOpen !== undefined && (
                <RejectDialog
                    isOpen={isRejectDialogOpen}
                    setIsOpen={setIsRejectDialogOpen}
                    isProcessing={isProcessing}
                    rejectionReason={rejectionReason}
                    setRejectionReason={setRejectionReason}
                    rejectKey={keys.reject}
                    rejectBtnKey={keys.rejectBtn}
                    onConfirm={handleRejectConfirm}
                />
            )}

            {isShipDialogOpen !== undefined && (
                <ShipDialog
                    isOpen={isShipDialogOpen}
                    setIsOpen={setIsShipDialogOpen}
                    isProcessing={isProcessing}
                    shipDescKey={keys.shipDesc}
                    onConfirm={handleShipConfirm}
                />
            )}

            {isReceiveDialogOpen !== undefined && (
                <ReceiveDialog
                    isOpen={isReceiveDialogOpen}
                    setIsOpen={setIsReceiveDialogOpen}
                    isProcessing={isProcessing}
                    type={type}
                    receiveDescKey={keys.receiveDesc}
                    onConfirm={handleReceiveConfirm}
                />
            )}
        </>
    );
}

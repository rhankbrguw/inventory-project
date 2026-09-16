import { useState } from 'react';
import { router } from '@inertiajs/react';

function submitAction(
    routeEndpoint: string,
    payload: Record<string, any> | FormData,
    setIsProcessing: (v: boolean) => void,
    onSuccess: () => void
) {
    setIsProcessing(true);
    router.post(routeEndpoint, payload, {
        onFinish: () => {
            setIsProcessing(false);
            onSuccess();
        },
        onError: () => setIsProcessing(false),
    });
}

export default function useTransactionActions(type: string, transactionId: string | number) {
    const [isShipDialogOpen, setIsShipDialogOpen] = useState(false);
    const [isReceiveDialogOpen, setIsReceiveDialogOpen] = useState(false);
    const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const basePath = type === 'sell' ? 'transactions.sells' : type === 'purchase' ? 'transactions.purchases' : 'transactions.transfers';

    const handleApproveConfirm = () =>
        submitAction(route(`${basePath}.approve`, transactionId), {}, setIsProcessing, () => setIsApproveDialogOpen(false));

    const handleRejectConfirm = () => {
        if (!rejectionReason.trim()) return;
        submitAction(route(`${basePath}.reject`, transactionId), { rejection_reason: rejectionReason }, setIsProcessing, () => {
            setIsRejectDialogOpen(false);
            setRejectionReason('');
        });
    };

    const handleShipConfirm = () =>
        submitAction(route(`${basePath}.ship`, transactionId), {}, setIsProcessing, () => setIsShipDialogOpen(false));

    const handleReceiveConfirm = (receiptPhoto: any) => {
        const formData = new FormData();
        formData.append('receipt_photo', receiptPhoto);
        submitAction(route(`${basePath}.receive`, transactionId), formData, setIsProcessing, () => setIsReceiveDialogOpen(false));
    };

    return {
        isShipDialogOpen, setIsShipDialogOpen,
        isReceiveDialogOpen, setIsReceiveDialogOpen,
        isApproveDialogOpen, setIsApproveDialogOpen,
        isRejectDialogOpen, setIsRejectDialogOpen,
        rejectionReason, setRejectionReason,
        isProcessing, setIsProcessing,
        handleApproveConfirm,
        handleRejectConfirm,
        handleShipConfirm,
        handleReceiveConfirm
    };
}

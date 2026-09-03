import { useState } from 'react';
import { router } from '@inertiajs/react';

export default function useTransactionActions(type, transactionId) {
    const [isShipDialogOpen, setIsShipDialogOpen] = useState(false);
    const [isReceiveDialogOpen, setIsReceiveDialogOpen] = useState(false);
    const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const basePath = type === 'sell' ? 'transactions.sells' : type === 'purchase' ? 'transactions.purchases' : 'transactions.transfers';

    const handleApproveConfirm = () => {
        setIsProcessing(true);
        try {
            router.post(
                route(`${basePath}.approve`, transactionId),
                {},
                {
                    onFinish: () => {
                        setIsProcessing(false);
                        setIsApproveDialogOpen(false);
                    },
                }
            );
        } catch {
            setIsProcessing(false);
        }
    };

    const handleRejectConfirm = () => {
        if (!rejectionReason.trim()) return;
        setIsProcessing(true);
        try {
            router.post(
                route(`${basePath}.reject`, transactionId),
                { rejection_reason: rejectionReason },
                {
                    onFinish: () => {
                        setIsProcessing(false);
                        setIsRejectDialogOpen(false);
                        setRejectionReason('');
                    },
                }
            );
        } catch {
            setIsProcessing(false);
        }
    };

    const handleShipConfirm = () => {
        setIsProcessing(true);
        try {
            router.post(
                route(`${basePath}.ship`, transactionId),
                {},
                {
                    onFinish: () => {
                        setIsProcessing(false);
                        setIsShipDialogOpen(false);
                    },
                }
            );
        } catch {
            setIsProcessing(false);
        }
    };

    const handleReceiveConfirm = (receiptPhoto) => {
        setIsProcessing(true);
        try {
            const formData = new FormData();
            formData.append('receipt_photo', receiptPhoto);

            router.post(
                route(`${basePath}.receive`, transactionId),
                formData,
                {
                    onFinish: () => {
                        setIsProcessing(false);
                        setIsReceiveDialogOpen(false);
                    },
                }
            );
        } catch {
            setIsProcessing(false);
        }
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

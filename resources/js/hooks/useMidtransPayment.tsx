import { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { openMidtransSnap } from '@/lib/midtrans';
import { router } from '@inertiajs/react';
import useTranslation from '@/hooks/useTranslation';

export function useMidtransPayment() {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);

    const handleSuccess = async (orderId: unknown, result: any, onComplete?: () => void) => {
        const id = orderId || result?.order_id;
        if (id) {
            try {
                await axios.post(route('payment.verify', id), { result });
            } catch {
                // Non-blocking fallback
            }
        }
        toast.success(t('messages.payment.success'));
        router.reload();
        onComplete?.();
    };

    const triggerPayment = async (endpoint: string, onComplete?: () => void) => {
        setLoading(true);
        try {
            const response = await axios.post(endpoint);
            const snapPayload = (response.data?.data ?? response.data) as { token?: string; order_id?: string };
            if (!snapPayload.token) throw new Error('Snap token empty');

            await openMidtransSnap(snapPayload.token, {
                onSuccess: async (result) => {
                    await handleSuccess(snapPayload.order_id, result, onComplete);
                },
                onPending: () => {
                    toast.info(t('messages.payment.pending'));
                    router.reload();
                    onComplete?.();
                },
                onError: (err: any) => toast.error(err?.status_message || t('messages.payment.failed')),
                onClose: () => {
                    setLoading(false);
                    toast.warning(t('messages.payment.cancelled'));
                },
            });
        } catch (err: any) {
            toast.error(err?.response?.data?.message || err?.message || t('messages.error'));
        } finally {
            setLoading(false);
        }
    };

    const paySell = (sellId: string | number, onComplete?: () => void) => triggerPayment(route('payment.sell.snap', sellId), onComplete);
    const payPurchase = (purchaseId: string | number, onComplete?: () => void) => triggerPayment(route('payment.purchase.snap', purchaseId), onComplete);
    const payInstallment = (installmentId: string | number, onComplete?: () => void) => triggerPayment(route('payment.installment.snap', installmentId), onComplete);

    return { paySell, payPurchase, payInstallment, loading };
}

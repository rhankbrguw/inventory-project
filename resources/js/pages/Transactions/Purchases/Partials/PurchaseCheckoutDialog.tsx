import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import PurchaseDetailsManager from './PurchaseDetailsManager';
import { formatCurrency } from '@/lib/utils';
import useTranslation from '@/hooks/useTranslation';

export default function PurchaseCheckoutDialog({
    isOpen,
    onOpenChange,
    selectedGroup,
    selectedSourceType,
    selectedSourceId,
    locations,
    suppliers,
    paymentMethods,
    onClose,
}) {
    const { t } = useTranslation();

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{t('ui.confirm_purchase')}</DialogTitle>
                    <DialogDescription>
                        {t('ui.complete_transaction_total')}{' '}
                        <span className="font-bold text-primary">
                            {formatCurrency(
                                selectedGroup?.items.reduce(
                                    (sum, item) =>
                                        sum +
                                        item.quantity * item.cost_per_unit,
                                    0
                                ) || 0
                            )}
                        </span>
                    </DialogDescription>
                </DialogHeader>

                <PurchaseDetailsManager
                    supplierId={selectedGroup?.supplier_id}
                    fromLocationId={
                        selectedSourceType === 'internal'
                            ? selectedSourceId
                            : null
                    }
                    locations={locations}
                    suppliers={suppliers}
                    paymentMethods={paymentMethods}
                    cartItems={selectedGroup?.items || []}
                    onClose={onClose}
                />
            </DialogContent>
        </Dialog>
    );
}

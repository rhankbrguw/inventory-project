import React from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import useTranslation from '@/hooks/useTranslation';

type ShipDialogProps = {
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    isProcessing: boolean;
    shipDescKey: string;
    onConfirm: () => void;
};

export default function ShipDialog({
    isOpen,
    setIsOpen,
    isProcessing,
    shipDescKey,
    onConfirm,
}: ShipDialogProps) {
    const { t } = useTranslation();

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t('ui.confirm_ship')}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {t(`ui.${shipDescKey}`)}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isProcessing}>
                        {t('ui.cancel')}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        disabled={isProcessing}
                        className="btn-transfer"
                    >
                        {isProcessing ? t('ui.processing') : t('ui.ship_goods')}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

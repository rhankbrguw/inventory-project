import type * as React from 'react';
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

type ApproveDialogProps = {
    isOpen: boolean;
    setIsOpen: (value: boolean) => void;
    isProcessing: boolean;
    confirmKey: string;
    onConfirm: () => void;
};

export default function ApproveDialog({
    isOpen,
    setIsOpen,
    isProcessing,
    confirmKey,
    onConfirm,
}: ApproveDialogProps) {
    const { t } = useTranslation();

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t(`ui.${confirmKey}`)}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {t(`ui.${confirmKey}_desc`)}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isProcessing}>
                        {t('ui.cancel')}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        disabled={isProcessing}
                        className="bg-success text-primary-foreground hover:bg-success/90"
                    >
                        {isProcessing ? t('ui.processing') : t('ui.yes_approve')}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

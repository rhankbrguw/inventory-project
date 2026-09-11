import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import useTranslation from '@/hooks/useTranslation';

type RejectDialogProps = {
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    isProcessing: boolean;
    rejectionReason: string;
    setRejectionReason: React.Dispatch<React.SetStateAction<string>>;
    rejectKey: string;
    rejectBtnKey: string;
    onConfirm: () => void;
};

export default function RejectDialog({
    isOpen,
    setIsOpen,
    isProcessing,
    rejectionReason,
    setRejectionReason,
    rejectKey,
    rejectBtnKey,
    onConfirm,
}: RejectDialogProps) {
    const { t } = useTranslation();

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="text-destructive">
                        {t(`ui.${rejectKey}`)}
                    </DialogTitle>
                    <DialogDescription>
                        {t(`ui.${rejectKey}_desc`)}
                    </DialogDescription>
                </DialogHeader>
                <Textarea
                    value={rejectionReason}
                    onChange={(event) => setRejectionReason(event.target.value)}
                    placeholder={t('ui.rejection_reason_placeholder')}
                    rows={3}
                />
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => setIsOpen(false)}
                        disabled={isProcessing}
                    >
                        {t('ui.cancel')}
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onConfirm}
                        disabled={isProcessing || !rejectionReason?.trim()}
                    >
                        {isProcessing ? t('ui.processing') : t(`ui.${rejectBtnKey}`)}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

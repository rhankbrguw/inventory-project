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

type DeleteConfirmationDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    title?: string;
    description?: string;
    confirmText?: string;
    isDeleting?: boolean;
};

export default function DeleteConfirmationDialog({
    open,
    onOpenChange,
    onConfirm,
    title,
    description,
    confirmText,
    isDeleting = false,
}: DeleteConfirmationDialogProps) {
    const { t } = useTranslation();
    
    const displayTitle = title || t('ui.delete_confirm_title');
    const displayDescription = description || t('ui.delete_confirm_desc');
    const displayConfirmText = confirmText || t('ui.delete');

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{displayTitle}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {displayDescription}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{t('ui.cancel')}</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="bg-destructive hover:bg-destructive/90"
                    >
                        {isDeleting ? t('ui.deleting') : displayConfirmText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

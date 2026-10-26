import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Camera, X, Loader2, CheckCircle2 } from 'lucide-react';
import useTranslation from '@/hooks/useTranslation';
import { compressImage } from '@/lib/imageCompressor';

type ReceiveDialogProps = {
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    isProcessing: boolean;
    type: 'sell' | 'purchase' | 'transfer' | string;
    receiveDescKey: string;
    onConfirm: (file: File | null) => void;
};

export default function ReceiveDialog({
    isOpen, setIsOpen, isProcessing, type, receiveDescKey, onConfirm,
}: ReceiveDialogProps) {
    const { t } = useTranslation();
    const [file, setFile] = React.useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
    const [isCompressing, setIsCompressing] = React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement | null>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const selected = event.target.files?.[0] ?? null;
        if (!selected) return;
        try {
            setIsCompressing(true);
            const optimized = await compressImage(selected);
            setFile(optimized);
            setPreviewUrl(URL.createObjectURL(optimized));
        } catch {
            setFile(selected);
            setPreviewUrl(URL.createObjectURL(selected));
        } finally {
            setIsCompressing(false);
        }
    };

    const handleRemoveFile = () => {
        setFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const resetState = (open: boolean) => {
        setIsOpen(open);
        if (!open) setTimeout(() => { setFile(null); setPreviewUrl(null); setIsCompressing(false); }, 300);
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={resetState}>
            <AlertDialogContent className="w-[calc(100%-2rem)] sm:max-w-md p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-xl border-border/80 mx-auto">
                <AlertDialogHeader className="space-y-1.5 text-left">
                    <AlertDialogTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                        <span>{t('ui.confirm_receive')}</span>
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        {t(`ui.${receiveDescKey}`)}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="space-y-2.5 my-1 sm:my-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('ui.proof_of_delivery')}</span>
                        <span className="text-[11px] font-medium text-destructive">*{t('ui.required')}</span>
                    </div>

                    {!previewUrl ? (
                        <div
                            onClick={() => !isCompressing && fileInputRef.current?.click()}
                            className="group border-2 border-dashed border-border/80 hover:border-primary/60 bg-muted/20 hover:bg-muted/40 transition-all rounded-xl p-4 sm:p-5 flex flex-col items-center justify-center text-center cursor-pointer gap-2"
                        >
                            <div className="p-2.5 rounded-full bg-primary/10 text-primary group-hover:scale-105 transition-transform">
                                {isCompressing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-xs sm:text-sm font-medium text-foreground">{isCompressing ? t('ui.processing') : t('ui.upload_receipt_photo')}</p>
                                <p className="text-[11px] text-muted-foreground">{t('ui.receipt_photo_required')}</p>
                            </div>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                        </div>
                    ) : (
                        <div className="relative border rounded-xl overflow-hidden bg-muted/10 group">
                            <img src={previewUrl} alt="Preview" className="w-full h-36 sm:h-44 object-contain bg-muted/40" />
                            <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Button variant="destructive" size="sm" onClick={handleRemoveFile} type="button" className="shadow-sm text-xs h-8 px-3">
                                    <X className="w-3.5 h-3.5 mr-1" /> {t('ui.remove_photo')}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                <AlertDialogFooter className="gap-2 sm:gap-2 pt-1 flex-col-reverse sm:flex-row">
                    <AlertDialogCancel disabled={isProcessing || isCompressing} className="mt-0 text-xs sm:text-sm h-9 sm:h-10">{t('ui.cancel')}</AlertDialogCancel>
                    <Button onClick={() => onConfirm(file)} disabled={isProcessing || isCompressing || !file} className={`text-xs sm:text-sm h-9 sm:h-10 font-medium ${type === 'sell' ? 'btn-sell' : 'btn-purchase'}`}>
                        {isProcessing ? t('ui.processing') : t('ui.receive_goods')}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

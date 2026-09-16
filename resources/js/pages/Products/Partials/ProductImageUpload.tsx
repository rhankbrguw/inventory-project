import { Button } from '@/components/ui/button';
import { ImageIcon, Trash2, Camera } from 'lucide-react';
import useTranslation from '@/hooks/useTranslation';
import InputError from '@/components/InputError';

export default function ProductImageUpload({ errors, fileInputRef, handleChange, handleRemove, triggerInput, preview, setData }) {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col items-center justify-center py-2">
            <input
                id="image"
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={(e) => handleChange(e, setData)}
            />

            {preview ? (
                <div className="flex flex-col items-center gap-3">
                    <div className="relative group w-36 h-36 rounded-2xl overflow-hidden border-2 border-border shadow-md bg-muted/20 flex items-center justify-center">
                        <img src={preview} alt="Product Preview" className="w-full h-full object-cover" />
                        <div
                            onClick={triggerInput}
                            className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center cursor-pointer text-foreground text-xs font-medium gap-1"
                        >
                            <Camera className="w-5 h-5" />
                            <span>{t('ui.change_photo')}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={triggerInput} className="h-8 text-xs font-medium gap-1.5">
                            <Camera className="w-3.5 h-3.5" />
                            {t('ui.change_photo')}
                        </Button>
                        <Button type="button" variant="ghost" size="sm" onClick={() => handleRemove ? handleRemove(setData) : setData('image', null)} className="h-8 text-xs font-medium text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5">
                            <Trash2 className="w-3.5 h-3.5" />
                            {t('ui.remove_photo')}
                        </Button>
                    </div>
                </div>
            ) : (
                <div
                    onClick={triggerInput}
                    className="w-full max-w-sm border-2 border-dashed border-border/80 hover:border-primary/60 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-muted/10 hover:bg-muted/30 transition-all duration-200 group"
                >
                    <div className="w-12 h-12 rounded-full bg-muted/60 group-hover:bg-primary/10 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors duration-200 mb-2">
                        <ImageIcon className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                        {t('ui.upload_product_photo')}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                        {t('ui.upload_photo_hint')}
                    </p>
                </div>
            )}

            <InputError message={errors?.image} className="mt-2 text-center" />
        </div>
    );
}


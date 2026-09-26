import type * as React from 'react';
import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/InputError';
import { Info } from 'lucide-react';
import useTranslation from '@/hooks/useTranslation';

type ExistingType = {
    id: number | string;
    name: string;
};

type QuickAddTypeModalProps = {
    group: string;
    title: string;
    description: string;
    existingTypes?: ExistingType[];
    trigger: React.ReactNode;
};

export default function QuickAddTypeModal({
    group, title, description, existingTypes = [], trigger,
}: QuickAddTypeModalProps) {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors, isDirty, reset } = useForm({
        name: '', code: '', group, _from_modal: true,
    });
    const [open, setOpen] = useState(false);

    const submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post(route('types.store'), {
            onSuccess: () => { setOpen(false); reset(); },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="w-[92vw] sm:max-w-md px-5 py-4 sm:p-4">
                <DialogHeader className="pb-2">
                    <DialogTitle className="text-base">{title}</DialogTitle>
                    <DialogDescription className="text-xs">{description}</DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-3 py-2">
                    <div className="space-y-1.5">
                        <Label htmlFor="typeName" className="text-xs font-medium">{t('ui.type_name')}</Label>
                        <Input id="typeName" value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder={t('ui.type_name_placeholder')} className="h-8 text-sm" />
                        <InputError message={errors.name} className="text-xs" />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="typeCode" className="text-xs font-medium">{t('ui.code_optional')}</Label>
                        <Input id="typeCode" value={data.code} onChange={(e) => setData('code', e.target.value)} placeholder={t('ui.type_code_placeholder')} className="h-8 text-sm" />
                        <InputError message={errors.code} />
                    </div>

                    {existingTypes.length > 0 && (
                        <Alert className="py-2 px-3">
                            <Info className="h-3.5 w-3.5" />
                            <AlertTitle className="text-xs font-semibold">{t('ui.existing_types')}</AlertTitle>
                            <AlertDescription className="flex flex-wrap gap-1.5 pt-1.5">
                                {existingTypes.map((type) => (
                                    <Badge key={String(type.id)} variant="secondary" className="text-[10px] px-1.5 py-0.5">{type.name}</Badge>
                                ))}
                            </AlertDescription>
                        </Alert>
                    )}

                    <DialogFooter className="gap-2 sm:gap-0 pt-2">
                        <DialogClose asChild>
                            <Button type="button" variant="outline" className="h-8 text-xs">{t('ui.cancel')}</Button>
                        </DialogClose>
                        <Button disabled={processing || !isDirty} className="h-8 text-xs">
                            {processing ? t('ui.saving') : t('ui.save')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

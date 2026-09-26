import type * as React from 'react';
import { useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/InputError';
import { InputWithPrefix } from '@/components/InputWithPrefix';
import useTranslation from '@/hooks/useTranslation';

type SupplierPayload = {
    name: string;
    email: string;
    phone: string;
    address: string;
    contact_person: string;
    _from_modal: boolean;
};

type QuickAddSupplierModalProps = {
    children: React.ReactNode;
    onSuccess: (supplier: Record<string, unknown>) => void;
};

export default function QuickAddSupplierModal({ children, onSuccess }: QuickAddSupplierModalProps) {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors, isDirty, reset } = useForm<SupplierPayload>({ name: '', email: '', phone: '', address: '', contact_person: '', _from_modal: true });
    const [open, setOpen] = useState(false);

    const submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post(route('suppliers.store'), {
            onSuccess: (page) => {
                const newSupplier = (page.props as { flash?: { newSupplier?: Record<string, unknown> } }).flash?.newSupplier;
                if (newSupplier) onSuccess(newSupplier);
                setOpen(false);
                reset();
                router.reload({ only: ['suppliers'] });
            },
        });
    };

    const handleOpenChange = (isOpen: boolean) => { setOpen(isOpen); if (!isOpen) reset(); };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="w-[92vw] sm:max-w-md px-5 py-4 sm:p-4">
                <DialogHeader className="pb-2">
                    <DialogTitle className="text-base">{t('ui.add_new_supplier')}</DialogTitle>
                    <DialogDescription className="text-xs">{t('ui.add_new_supplier_desc')}</DialogDescription>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-3 py-2">
                    <div className="space-y-1.5">
                        <Label htmlFor="supplierName" className="text-xs font-medium">{t('ui.supplier_name')}</Label>
                        <Input id="supplierName" placeholder={t('ui.supplier_name_placeholder')} value={data.name} onChange={(e) => setData('name', e.target.value)} className="h-8 text-sm" />
                        <InputError message={errors.name} />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="supplierContactPerson" className="text-xs font-medium">{t('ui.coordinator')}</Label>
                        <Input id="supplierContactPerson" placeholder={t('ui.coordinator_placeholder')} value={data.contact_person} onChange={(e) => setData('contact_person', e.target.value)} className="h-8 text-sm" />
                        <InputError message={errors.contact_person} />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="supplierEmail" className="text-xs font-medium">{t('ui.supplier_email')}</Label>
                        <Input id="supplierEmail" type="email" placeholder={t('ui.supplier_email_example')} value={data.email} onChange={(e) => setData('email', e.target.value)} className="h-8 text-sm" />
                        <InputError message={errors.email} />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="supplierPhone" className="text-xs font-medium">{t('ui.phone_optional')}</Label>
                        <InputWithPrefix prefix="+62" id="supplierPhone" placeholder={t('ui.phone_placeholder')} value={data.phone} onChange={(e) => setData('phone', e.target.value.replace(/\D/g, ''))} className="h-8 text-sm" />
                        <InputError message={errors.phone} />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="supplierAddress" className="text-xs font-medium">{t('ui.address')}</Label>
                        <Input id="supplierAddress" placeholder={t('ui.supplier_address_placeholder')} value={data.address} onChange={(e) => setData('address', e.target.value)} className="h-8 text-sm" />
                        <InputError message={errors.address} />
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0 pt-2">
                        <DialogClose asChild><Button type="button" variant="outline" className="h-8 text-xs">{t('ui.cancel')}</Button></DialogClose>
                        <Button disabled={processing || !isDirty} className="h-8 text-xs">{processing ? t('ui.saving') : t('ui.save')}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

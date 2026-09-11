import type * as React from 'react';
import { useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/InputError';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InputWithPrefix } from '@/components/InputWithPrefix';
import useTranslation from '@/hooks/useTranslation';

type CustomerType = {
    id: number | string;
    name: string;
};

type CustomerPayload = {
    name: string;
    email: string;
    phone: string;
    address: string;
    type_id: string;
    _from_modal: boolean;
};

type QuickAddCustomerModalProps = {
    children: React.ReactNode;
    customerTypes: CustomerType[];
    onSuccess: (customer: Record<string, unknown>) => void;
};

export default function QuickAddCustomerModal({ children, customerTypes, onSuccess }: QuickAddCustomerModalProps) {
    const { data, setData, post, processing, errors, isDirty, reset } = useForm<CustomerPayload>({ name: '', email: '', phone: '', address: '', type_id: '', _from_modal: true });
    const [open, setOpen] = useState(false);
    const { t } = useTranslation();

    const submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post(route('customers.store'), {
            onSuccess: (page) => {
                const newCustomer = (page.props as { flash?: { newCustomer?: Record<string, unknown> } }).flash?.newCustomer;
                if (newCustomer) onSuccess(newCustomer);
                setOpen(false);
                reset();
                router.reload({ only: ['customers'] });
            },
        });
    };

    const handleOpenChange = (isOpen: boolean) => { setOpen(isOpen); if (!isOpen) reset(); };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="w-[92vw] sm:max-w-md px-5 py-4 sm:p-4">
                <DialogHeader className="pb-2">
                    <DialogTitle className="text-base">{t('ui.add_new_customer')}</DialogTitle>
                    <DialogDescription className="text-xs">{t('ui.add_new_customer_desc')}</DialogDescription>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-3 py-2">
                    <div className="space-y-1.5">
                        <Label htmlFor="customerName" className="text-xs font-medium">{t('ui.customer_name')}</Label>
                        <Input id="customerName" placeholder={t('ui.customer_name_placeholder')} value={data.name} onChange={(e) => setData('name', e.target.value)} className="h-8 text-sm" />
                        <InputError message={errors.name} />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="customerEmail" className="text-xs font-medium">{t('ui.customer_email')}</Label>
                        <Input id="customerEmail" type="email" placeholder={t('ui.email_example')} value={data.email} onChange={(e) => setData('email', e.target.value)} className="h-8 text-sm" />
                        <InputError message={errors.email} />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="customerType" className="text-xs font-medium">{t('ui.customer_type')}</Label>
                        <Select value={data.type_id} onValueChange={(value) => setData('type_id', value)}>
                            <SelectTrigger id="customerType" className="h-8 text-sm"><SelectValue placeholder={t('ui.select_customer_type')} /></SelectTrigger>
                            <SelectContent><SelectGroup>{customerTypes.map((tp) => <SelectItem key={tp.id} value={String(tp.id)} className="text-sm">{tp.name}</SelectItem>)}</SelectGroup></SelectContent>
                        </Select>
                        <InputError message={errors.type_id} />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="customerPhone" className="text-xs font-medium">{t('ui.phone_optional')}</Label>
                        <InputWithPrefix prefix="+62" id="customerPhone" placeholder={t('ui.phone_placeholder')} value={data.phone} onChange={(e) => setData('phone', e.target.value.replace(/\D/g, ''))} className="h-8 text-sm" />
                        <InputError message={errors.phone} />
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

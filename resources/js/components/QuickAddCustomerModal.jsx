import { useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/InputError';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { InputWithPrefix } from '@/components/InputWithPrefix';

export default function QuickAddCustomerModal({
    children,
    customerTypes,
    onSuccess,
}) {
    const { data, setData, post, processing, errors, isDirty, reset } = useForm(
        {
            name: '',
            email: '',
            phone: '',
            address: '',
            type_id: '',
            _from_modal: true,
        }
    );

    const [open, setOpen] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        post(route('customers.store'), {
            preserveScroll: true,
            onSuccess: (page) => {
                const newCustomer = page.props.flash.newCustomer;
                if (newCustomer) onSuccess(newCustomer);
                setOpen(false);
                reset();
                router.reload({
                    only: ['customers'],
                    preserveScroll: true,
                });
            },
        });
    };

    const handleOpenChange = (isOpen) => {
        setOpen(isOpen);
        if (!isOpen) reset();
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>{children}</DialogTrigger>

            <DialogContent className="w-[92vw] sm:max-w-md px-5 py-4 sm:p-4">
                <DialogHeader className="pb-2">
                    <DialogTitle className="text-base">
                        Tambah Pelanggan Baru
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                        Masukkan detail untuk pelanggan baru.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-3 py-2">
                    <div className="space-y-1.5">
                        <Label
                            htmlFor="customerName"
                            className="text-xs font-medium"
                        >
                            Nama Pelanggan
                        </Label>
                        <Input
                            id="customerName"
                            placeholder="Nama Lengkap Pelanggan"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="h-8 text-sm"
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="space-y-1.5">
                        <Label
                            htmlFor="customerEmail"
                            className="text-xs font-medium"
                        >
                            Email Pelanggan
                        </Label>
                        <Input
                            id="customerEmail"
                            type="email"
                            placeholder="email@contoh.com"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className="h-8 text-sm"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="space-y-1.5">
                        <Label
                            htmlFor="customerType"
                            className="text-xs font-medium"
                        >
                            Tipe Pelanggan
                        </Label>
                        <Select
                            value={data.type_id}
                            onValueChange={(value) => setData('type_id', value)}
                        >
                            <SelectTrigger
                                id="customerType"
                                className="h-8 text-sm"
                            >
                                <SelectValue placeholder="Pilih Tipe Pelanggan" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    {customerTypes.map((type) => (
                                        <SelectItem
                                            key={type.id}
                                            value={type.id.toString()}
                                            className="text-sm"
                                        >
                                            {type.name}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        <InputError message={errors.type_id} />
                    </div>

                    <div className="space-y-1.5">
                        <Label
                            htmlFor="customerPhone"
                            className="text-xs font-medium"
                        >
                            Nomor Telepon (Opsional)
                        </Label>
                        <InputWithPrefix
                            prefix="+62"
                            id="customerPhone"
                            placeholder="81234567890"
                            value={data.phone}
                            onChange={(e) =>
                                setData(
                                    'phone',
                                    e.target.value.replace(/\D/g, '')
                                )
                            }
                            className="h-8 text-sm"
                        />
                        <InputError message={errors.phone} />
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0 pt-2">
                        <DialogClose asChild>
                            <Button
                                type="button"
                                variant="outline"
                                className="h-8 text-xs"
                            >
                                Batal
                            </Button>
                        </DialogClose>
                        <Button
                            disabled={processing || !isDirty}
                            className="h-8 text-xs"
                        >
                            {processing ? 'Menyimpan...' : 'Simpan'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

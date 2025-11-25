
import { useForm, router } from "@inertiajs/react";
import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import InputError from "@/components/InputError";
import FormField from "@/components/FormField";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { InputWithPrefix } from "@/components/InputWithPrefix";

export default function QuickAddCustomerModal({ children, customerTypes, onSuccess }) {
    const { data, setData, post, processing, errors, isDirty, reset } = useForm({
        name: "",
        email: "",
        phone: "",
        address: "",
        type_id: "",
        _from_modal: true,
    });

    const [open, setOpen] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        post(route("customers.store"), {
            preserveScroll: true,
            onSuccess: (page) => {
                const newCustomer = page.props.flash.newCustomer;
                if (newCustomer) onSuccess(newCustomer);
                setOpen(false);
                reset();
                router.reload({
                    only: ["customers"],
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

            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Tambah Pelanggan Baru</DialogTitle>
                    <DialogDescription>
                        Masukkan detail untuk pelanggan baru.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4 py-4">
                    <FormField label="Nama Pelanggan" htmlFor="customerName">
                        <Input
                            id="customerName"
                            placeholder="Nama Lengkap Pelanggan"
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                        />
                        <InputError message={errors.name} />
                    </FormField>

                    <FormField label="Email Pelanggan" htmlFor="customerEmail">
                        <Input
                            id="customerEmail"
                            type="email"
                            placeholder="email@contoh.com"
                            value={data.email}
                            onChange={(e) => setData("email", e.target.value)}
                        />
                        <InputError message={errors.email} />
                    </FormField>

                    <FormField label="Tipe Pelanggan" htmlFor="customerType">
                        <Select
                            value={data.type_id}
                            onValueChange={(value) => setData("type_id", value)}
                        >
                            <SelectTrigger id="customerType">
                                <SelectValue placeholder="Pilih Tipe Pelanggan" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    {customerTypes.map((type) => (
                                        <SelectItem key={type.id} value={type.id.toString()}>
                                            {type.name}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        <InputError message={errors.type_id} />
                    </FormField>

                    <FormField label="Nomor Telepon (Opsional)" htmlFor="customerPhone">
                        <InputWithPrefix
                            prefix="+62"
                            id="customerPhone"
                            placeholder="81234567890"
                            value={data.phone}
                            onChange={(e) =>
                                setData("phone", e.target.value.replace(/\D/g, ""))
                            }
                        />
                        <InputError message={errors.phone} />
                    </FormField>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">Batal</Button>
                        </DialogClose>
                        <Button disabled={processing || !isDirty}>
                            {processing ? "Menyimpan..." : "Simpan"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}


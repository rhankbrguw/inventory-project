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
import { Label } from "@/components/ui/label";
import InputError from "@/components/InputError";
import FormField from "@/components/FormField";
import { InputWithPrefix } from "@/components/InputWithPrefix";

export default function QuickAddSupplierModal({ children, onSuccess }) {
    const { data, setData, post, processing, errors, isDirty, reset } = useForm(
        {
            name: "",
            email: "",
            phone: "",
            address: "",
            contact_person: "",
            _from_modal: true,
        },
    );
    const [open, setOpen] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        post(route("suppliers.store"), {
            preserveScroll: true,
            onSuccess: (page) => {
                const newSupplier = page.props.flash.newSupplier;
                if (newSupplier) {
                    onSuccess(newSupplier);
                }
                setOpen(false);
                reset();
                router.reload({
                    only: ["suppliers"],
                    preserveScroll: true,
                });
            },
        });
    };

    const handleOpenChange = (isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
            reset();
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Tambah Supplier Baru</DialogTitle>
                    <DialogDescription>
                        Masukkan detail untuk supplier baru.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4 py-4">
                    <FormField label="Nama Supplier" htmlFor="supplierName">
                        <Input
                            id="supplierName"
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                        />
                        <InputError message={errors.name} />
                    </FormField>

                    <FormField
                        label="Koordinator"
                        htmlFor="supplierContactPerson"
                    >
                        <Input
                            id="supplierContactPerson"
                            value={data.contact_person}
                            onChange={(e) =>
                                setData("contact_person", e.target.value)
                            }
                        />
                        <InputError message={errors.contact_person} />
                    </FormField>

                    <FormField label="Email Supplier" htmlFor="supplierEmail">
                        <Input
                            id="supplierEmail"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData("email", e.target.value)}
                        />
                        <InputError message={errors.email} />
                    </FormField>

                    <FormField
                        label="Nomor Telepon (Opsional)"
                        htmlFor="supplierPhone"
                    >
                        <InputWithPrefix
                            prefix="+62"
                            id="supplierPhone"
                            value={data.phone}
                            onChange={(e) =>
                                setData(
                                    "phone",
                                    e.target.value.replace(/\D/g, ""),
                                )
                            }
                            placeholder="81234567890"
                        />
                        <InputError message={errors.phone} />
                    </FormField>

                    <FormField label="Alamat" htmlFor="supplierAddress">
                        <Input
                            id="supplierAddress"
                            value={data.address}
                            onChange={(e) => setData("address", e.target.value)}
                        />
                        <InputError message={errors.address} />
                    </FormField>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">
                                Batal
                            </Button>
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

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
                if (newSupplier) onSuccess(newSupplier);

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
        if (!isOpen) reset();
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>{children}</DialogTrigger>

            <DialogContent className="w-[92vw] sm:max-w-md px-5 py-4 sm:p-4">
                <DialogHeader className="pb-2">
                    <DialogTitle className="text-base">
                        Tambah Supplier Baru
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                        Masukkan detail untuk supplier baru.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-3 py-2">
                    <div className="space-y-1.5">
                        <Label
                            htmlFor="supplierName"
                            className="text-xs font-medium"
                        >
                            Nama Supplier
                        </Label>
                        <Input
                            id="supplierName"
                            placeholder="Nama Perusahaan Supplier"
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                            className="h-8 text-sm"
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="space-y-1.5">
                        <Label
                            htmlFor="supplierContactPerson"
                            className="text-xs font-medium"
                        >
                            Koordinator
                        </Label>
                        <Input
                            id="supplierContactPerson"
                            placeholder="Nama PIC / Sales"
                            value={data.contact_person}
                            onChange={(e) =>
                                setData("contact_person", e.target.value)
                            }
                            className="h-8 text-sm"
                        />
                        <InputError message={errors.contact_person} />
                    </div>

                    <div className="space-y-1.5">
                        <Label
                            htmlFor="supplierEmail"
                            className="text-xs font-medium"
                        >
                            Email Supplier
                        </Label>
                        <Input
                            id="supplierEmail"
                            type="email"
                            placeholder="email@supplier.com"
                            value={data.email}
                            onChange={(e) => setData("email", e.target.value)}
                            className="h-8 text-sm"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="space-y-1.5">
                        <Label
                            htmlFor="supplierPhone"
                            className="text-xs font-medium"
                        >
                            Nomor Telepon (Opsional)
                        </Label>
                        <InputWithPrefix
                            prefix="+62"
                            id="supplierPhone"
                            placeholder="81234567890"
                            value={data.phone}
                            onChange={(e) =>
                                setData(
                                    "phone",
                                    e.target.value.replace(/\D/g, ""),
                                )
                            }
                            className="h-8 text-sm"
                        />
                        <InputError message={errors.phone} />
                    </div>

                    <div className="space-y-1.5">
                        <Label
                            htmlFor="supplierAddress"
                            className="text-xs font-medium"
                        >
                            Alamat
                        </Label>
                        <Input
                            id="supplierAddress"
                            placeholder="Alamat kantor/gudang supplier..."
                            value={data.address}
                            onChange={(e) => setData("address", e.target.value)}
                            className="h-8 text-sm"
                        />
                        <InputError message={errors.address} />
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
                            {processing ? "Menyimpan..." : "Simpan"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

import { useForm } from "@inertiajs/react";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import InputError from "@/components/InputError";
import { Info } from "lucide-react";

export default function QuickAddTypeModal({
    group,
    title,
    description,
    existingTypes = [],
    trigger,
}) {
    const { data, setData, post, processing, errors, isDirty, reset } = useForm(
        {
            name: "",
            code: "",
            group: group,
            _from_modal: true,
        },
    );

    const [open, setOpen] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        post(route("types.store"), {
            preserveScroll: true,
            onSuccess: () => {
                setOpen(false);
                reset();
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>

            <DialogContent className="w-[92vw] sm:max-w-md px-5 py-4 sm:p-4">
                <DialogHeader className="pb-2">
                    <DialogTitle className="text-base">{title}</DialogTitle>
                    <DialogDescription className="text-xs">
                        {description}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-3 py-2">
                    <div className="space-y-1.5">
                        <Label
                            htmlFor="typeName"
                            className="text-xs font-medium"
                        >
                            Nama Tipe
                        </Label>
                        <Input
                            id="typeName"
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                            placeholder="Masukkan nama tipe"
                            className="h-8 text-sm"
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="space-y-1.5">
                        <Label
                            htmlFor="typeCode"
                            className="text-xs font-medium"
                        >
                            Kode (Opsional)
                        </Label>
                        <Input
                            id="typeCode"
                            value={data.code}
                            onChange={(e) => setData("code", e.target.value)}
                            placeholder="Masukkan kode tipe"
                            className="h-8 text-sm"
                        />
                        <InputError message={errors.code} />
                    </div>

                    {existingTypes.length > 0 && (
                        <Alert className="py-2 px-3">
                            <Info className="h-3.5 w-3.5" />
                            <AlertTitle className="text-xs font-semibold">
                                Tipe yang sudah ada
                            </AlertTitle>
                            <AlertDescription className="flex flex-wrap gap-1.5 pt-1.5">
                                {existingTypes.map((type) => (
                                    <Badge
                                        key={type.id}
                                        variant="secondary"
                                        className="text-[10px] px-1.5 py-0.5"
                                    >
                                        {type.name}
                                    </Badge>
                                ))}
                            </AlertDescription>
                        </Alert>
                    )}

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
                            Simpan
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

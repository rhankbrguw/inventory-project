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
        }
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
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4 py-4">
                    <div>
                        <Label htmlFor="typeName">Nama Tipe</Label>
                        <Input
                            id="typeName"
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                            className="mt-1"
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>
                    <div>
                        <Label htmlFor="typeCode">Kode (Opsional)</Label>
                        <Input
                            id="typeCode"
                            value={data.code}
                            onChange={(e) => setData("code", e.target.value)}
                            className="mt-1"
                        />
                        <InputError message={errors.code} className="mt-2" />
                    </div>
                    {existingTypes.length > 0 && (
                        <Alert>
                            <Info className="h-4 w-4" />
                            <AlertTitle>Tipe yang Sudah Ada</AlertTitle>
                            <AlertDescription className="flex flex-wrap gap-2 pt-2">
                                {existingTypes.map((type) => (
                                    <Badge key={type.id} variant="secondary">
                                        {type.name}
                                    </Badge>
                                ))}
                            </AlertDescription>
                        </Alert>
                    )}
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">
                                Batal
                            </Button>
                        </DialogClose>
                        <Button disabled={processing || !isDirty}>
                            Simpan
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

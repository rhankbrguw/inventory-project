import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Button } from "@/Components/ui/button";
import InputError from "@/Components/InputError";
import { Alert, AlertDescription, AlertTitle } from "@/Components/ui/alert";
import { Badge } from "@/Components/ui/badge";
import { Info } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";

export default function Edit({ auth, type, availableGroups, allTypes }) {
    const { data, setData, patch, processing, errors, isDirty } = useForm({
        name: type.name || "",
        group: type.group || "",
        code: type.code || "",
    });

    const submit = (e) => {
        e.preventDefault();
        patch(route("types.update", type.id));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-foreground leading-tight">
                    Edit Tipe: {type.name}
                </h2>
            }
        >
            <Head title="Edit Tipe" />

            <div className="py-6 max-w-4xl mx-auto sm:px-6 lg:px-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Informasi Tipe</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <Label htmlFor="name">Nama Tipe</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData("name", e.target.value)
                                        }
                                        className="mt-1"
                                    />
                                    <InputError
                                        message={errors.name}
                                        className="mt-2"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="group">Grup Tipe</Label>
                                    <Select
                                        value={data.group}
                                        onValueChange={(value) =>
                                            setData("group", value)
                                        }
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder="Pilih grup..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(
                                                availableGroups
                                            ).map(([value, label]) => (
                                                <SelectItem
                                                    key={value}
                                                    value={value}
                                                >
                                                    {label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError
                                        message={errors.group}
                                        className="mt-2"
                                    />
                                </div>
                            </div>

                            {data.group && allTypes[data.group] && (
                                <Alert>
                                    <Info className="h-4 w-4" />
                                    <AlertTitle>
                                        Tipe yang Sudah Ada di Grup Ini:
                                    </AlertTitle>
                                    <AlertDescription className="flex flex-wrap gap-2 pt-2">
                                        {allTypes[data.group].map((type) => (
                                            <Badge
                                                key={type.id}
                                                variant="secondary"
                                            >
                                                {type.name}
                                            </Badge>
                                        ))}
                                    </AlertDescription>
                                </Alert>
                            )}

                            <div>
                                <Label htmlFor="code">Kode (Opsional)</Label>
                                <Input
                                    id="code"
                                    value={data.code}
                                    onChange={(e) =>
                                        setData("code", e.target.value)
                                    }
                                    className="mt-1"
                                />
                                <InputError
                                    message={errors.code}
                                    className="mt-2"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-4 pt-2">
                                <Link href={route("types.index")}>
                                    <Button type="button" variant="outline">
                                        Batal
                                    </Button>
                                </Link>
                                <Button disabled={processing || !isDirty}>
                                    Simpan Perubahan
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}

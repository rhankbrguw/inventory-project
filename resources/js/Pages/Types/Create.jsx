import { Link, useForm } from "@inertiajs/react";
import ContentPageLayout from "@/Components/ContentPageLayout";
import FormField from "@/Components/FormField";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
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
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/Components/ui/card";

export default function Create({ auth, availableGroups, allTypes }) {
    const { data, setData, post, processing, errors, isDirty } = useForm({
        name: "",
        group: "",
        code: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("types.store"));
    };

    return (
        <ContentPageLayout
            auth={auth}
            title="Tambah Tipe Baru"
            backRoute="types.index"
        >
            <Card>
                <CardHeader>
                    <CardTitle>Informasi Tipe</CardTitle>
                    <CardDescription>
                        Isi detail untuk tipe baru yang akan dibuat.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                label="Nama Tipe"
                                htmlFor="name"
                                error={errors.name}
                            >
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData("name", e.target.value)
                                    }
                                    placeholder="Contoh: Bahan Baku"
                                />
                            </FormField>
                            <FormField
                                label="Grup Tipe"
                                htmlFor="group"
                                error={errors.group}
                            >
                                <Select
                                    value={data.group}
                                    onValueChange={(value) =>
                                        setData("group", value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih grup..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(availableGroups).map(
                                            ([value, label]) => (
                                                <SelectItem
                                                    key={value}
                                                    value={value}
                                                >
                                                    {label}
                                                </SelectItem>
                                            )
                                        )}
                                    </SelectContent>
                                </Select>
                            </FormField>
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

                        <FormField
                            label="Kode (Opsional)"
                            htmlFor="code"
                            error={errors.code}
                        >
                            <Input
                                id="code"
                                value={data.code}
                                onChange={(e) =>
                                    setData("code", e.target.value)
                                }
                                placeholder="Contoh: BB"
                            />
                        </FormField>

                        <div className="flex items-center justify-end gap-4 pt-2">
                            <Link href={route("types.index")}>
                                <Button type="button" variant="outline">
                                    Batal
                                </Button>
                            </Link>
                            <Button disabled={processing || !isDirty}>
                                Simpan
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </ContentPageLayout>
    );
}

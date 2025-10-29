import ContentPageLayout from "@/components/ContentPageLayout";
import FormField from "@/components/FormField";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Link, useForm } from "@inertiajs/react";
import { Info } from "lucide-react";

export default function Edit({
    auth,
    type: typeResource,
    availableGroups,
    allTypes,
}) {
    const { data: type } = typeResource;
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
        <ContentPageLayout
            auth={auth}
            title="Edit Tipe"
            backRoute="types.index"
        >
            <Card>
                <CardHeader>
                    <CardTitle>{type.name}</CardTitle> ame
                    <CardDescription>
                        Ubah detail untuk tipe yang sudah ada.
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
                                />
                            </FormField>
                            <FormField
                                label="Grup Tipe"
                                htmlFor="group"
                                error={errors.group}
                                description={
                                    data.group &&
                                    availableGroups[data.group]?.description
                                }
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
                                            ([value, { label }]) => (
                                                <SelectItem
                                                    key={value}
                                                    value={value}
                                                >
                                                    {label}
                                                </SelectItem>
                                            ),
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
                                    {allTypes[data.group]
                                        .filter((t) => t.id !== type.id)
                                        .map((t) => (
                                            <Badge
                                                key={t.id}
                                                variant="secondary"
                                            >
                                                {t.name}
                                            </Badge>
                                        ))}
                                </AlertDescription>
                            </Alert>
                        )}

                        <FormField
                            label="Kode (Opsional)"
                            htmlFor="code"
                            error={errors.code}
                            description="Kode unik singkat untuk referensi cepat jika diperlukan."
                        >
                            <Input
                                id="code"
                                value={data.code}
                                onChange={(e) =>
                                    setData("code", e.target.value)
                                }
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

import { Link, useForm } from "@inertiajs/react";
import ContentPageLayout from "@/components/ContentPageLayout";
import FormField from "@/components/FormField";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";

export default function Create({ auth, availableGroups, allTypes }) {
    const { data, setData, post, processing, errors, isDirty } = useForm({
        name: "",
        group: "",
        code: "",
        level: "",
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
                        Isi detail untuk tipe baru yang akan digunakan pada
                        modul lain.
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
                                    placeholder="Masukan nama tipe baru"
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
                                        <SelectValue placeholder="Pilih grup tipe" />
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

                        {(data.group === "user_role" ||
                            data.group === "location_type") && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        label="Level Akses / Kategori"
                                        htmlFor="level"
                                        error={errors.level}
                                        description={
                                            data.group === "user_role"
                                                ? "1=Admin, 10=Manager, 20=Staff/Lainnya."
                                                : "1=Penyimpanan (Gudang/Pusat), 2=Penjualan (Cabang/Outlet/Kiosk)."
                                        }
                                    >
                                        <Input
                                            id="level"
                                            type="number"
                                            min="1"
                                            max="100"
                                            value={data.level}
                                            onChange={(e) =>
                                                setData("level", e.target.value)
                                            }
                                            placeholder={
                                                data.group === "user_role"
                                                    ? "20"
                                                    : "2"
                                            }
                                        />
                                    </FormField>
                                </div>
                            )}

                        {data.group && allTypes[data.group] && (
                            <Alert>
                                <Info className="h-4 w-4" />
                                <AlertTitle>Tipe pada grup ini</AlertTitle>
                                <AlertDescription className="flex flex-wrap gap-2 pt-2">
                                    {allTypes[data.group].map((type) => (
                                        <Badge
                                            key={type.id}
                                            variant="secondary"
                                        >
                                            {type.name}
                                            {type.level
                                                ? ` (Lvl ${type.level})`
                                                : ""}
                                        </Badge>
                                    ))}
                                </AlertDescription>
                            </Alert>
                        )}

                        <FormField
                            label="Kode (Opsional)"
                            htmlFor="code"
                            error={errors.code}
                            description="Kode singkat untuk referensi cepat."
                        >
                            <Input
                                id="code"
                                value={data.code}
                                onChange={(e) =>
                                    setData("code", e.target.value)
                                }
                                placeholder="Masukkan kode tipe"
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

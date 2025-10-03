import { Link, useForm } from "@inertiajs/react";
import ContentPageLayout from "@/Components/ContentPageLayout";
import FormField from "@/Components/FormField";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { Textarea } from "@/Components/ui/textarea";

export default function Edit({
    auth,
    location,
    locationTypes,
    branchManagers,
    warehouseManagers,
}) {
    const { data, setData, patch, processing, errors, isDirty } = useForm({
        name: location.name || "",
        type_id: location.type_id?.toString() || "",
        manager_id: location.manager_id?.toString() || "",
        address: location.address || "",
    });

    const selectedType = locationTypes.find(
        (type) => type.id.toString() === data.type_id
    );
    const availableManagers =
        selectedType?.name === "Warehouse" ? warehouseManagers : branchManagers;

    const submit = (e) => {
        e.preventDefault();
        patch(route("locations.update", location.id));
    };

    return (
        <ContentPageLayout
            auth={auth}
            title="Edit Lokasi"
            backRoute="locations.index"
        >
            <Card>
                <CardHeader>
                    <CardTitle>{location.name}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={submit} className="space-y-6">
                        <FormField
                            label="Nama Lokasi"
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                label="Tipe Lokasi"
                                htmlFor="type_id"
                                error={errors.type_id}
                            >
                                <Select
                                    value={data.type_id}
                                    onValueChange={(value) =>
                                        setData("type_id", value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih tipe..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {locationTypes.map((type) => (
                                            <SelectItem
                                                key={type.id}
                                                value={type.id.toString()}
                                            >
                                                {type.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormField>
                            <FormField
                                label="Manajer (Opsional)"
                                htmlFor="manager_id"
                                error={errors.manager_id}
                            >
                                <Select
                                    value={data.manager_id}
                                    onValueChange={(value) => {
                                        setData(
                                            "manager_id",
                                            value === "none" ? "" : value
                                        );
                                    }}
                                    disabled={!data.type_id}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih tipe lokasi dulu..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">
                                            Tanpa Manajer
                                        </SelectItem>
                                        {availableManagers.map((manager) => (
                                            <SelectItem
                                                key={manager.id}
                                                value={manager.id.toString()}
                                            >
                                                {manager.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormField>
                        </div>
                        <FormField
                            label="Alamat (Opsional)"
                            htmlFor="address"
                            error={errors.address}
                        >
                            <Textarea
                                id="address"
                                value={data.address}
                                onChange={(e) =>
                                    setData("address", e.target.value)
                                }
                            />
                        </FormField>
                        <div className="flex items-center justify-end gap-4">
                            <Link href={route("locations.index")}>
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
        </ContentPageLayout>
    );
}

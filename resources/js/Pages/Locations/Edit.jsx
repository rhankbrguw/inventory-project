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
import AssignmentManager from "./Partials/AssignmentManager";

export default function Edit({
    auth,
    location: locationResource,
    locationTypes,
    allUsers,
    allRoles,
}) {
    const { data: location } = locationResource;

    const { data, setData, patch, processing, errors, isDirty } = useForm({
        name: location.name || "",
        type_id: location.type_id?.toString() || "",
        address: location.address || "",
        assignments:
            location.users?.map((user) => ({
                user_id: user.pivot.user_id.toString(),
                role_id: user.pivot.role_id.toString(),
            })) || [],
    });

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
            <form onSubmit={submit} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Detail Lokasi</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <FormField
                            label="Nama Lokasi"
                            htmlFor="name"
                            error={errors.name}
                        >
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData("name", e.g.et.value)}
                            />
                        </FormField>
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
                    </CardContent>
                </Card>

                <AssignmentManager
                    assignments={data.assignments}
                    allUsers={allUsers}
                    allRoles={allRoles}
                    errors={errors}
                    setData={setData}
                />

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
        </ContentPageLayout>
    );
}

import { Link, useForm } from '@inertiajs/react';
import { useMemo, useEffect, useState } from 'react';
import ContentPageLayout from '@/components/ContentPageLayout';
import FormField from '@/components/FormField';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AssignmentManager from './Partials/AssignmentManager';

export default function Edit({
    auth,
    location: locationResource,
    locationTypes = [],
    allUsers = [],
    allRoles = [],
}) {
    const { data: location } = locationResource;

    const initialAssignments = useMemo(
        () =>
            location.users?.map((user) => ({
                user_id: user.id.toString(),
                role_id: user.pivot.role_id.toString(),
            })) || [],
        [location.users]
    );

    const { data, setData, patch, processing, errors, isDirty } = useForm({
        name: location.name || '',
        type_id: location.type?.id?.toString() || '',
        address: location.address || '',
        assignments: initialAssignments,
    });

    const [isFormDirty, setIsFormDirty] = useState(false);

    useEffect(() => {
        const assignmentsChanged =
            JSON.stringify(data.assignments) !==
            JSON.stringify(initialAssignments);
        setIsFormDirty(isDirty || assignmentsChanged);
    }, [data, isDirty, initialAssignments]);

    const selectedLocationType = useMemo(() => {
        return locationTypes.find(
            (type) => type.id.toString() === data.type_id
        );
    }, [data.type_id, locationTypes]);

    const submit = (e) => {
        e.preventDefault();
        patch(route('locations.update', location.id));
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
                                placeholder="Contoh: Gudang Pusat A"
                                value={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                            />
                        </FormField>

                        <FormField
                            label="Tipe Lokasi"
                            htmlFor="type_id"
                            error={errors.type_id}
                        >
                            <Select
                                value={data.type_id}
                                onValueChange={(value) => {
                                    setData('type_id', value);
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Tipe Lokasi" />
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
                                placeholder="Masukkan alamat lengkap lokasi..."
                                value={data.address}
                                onChange={(e) =>
                                    setData('address', e.target.value)
                                }
                            />
                        </FormField>
                    </CardContent>
                </Card>

                <AssignmentManager
                    assignments={data.assignments}
                    allUsers={allUsers}
                    allRoles={allRoles}
                    locationType={selectedLocationType}
                    errors={errors}
                    setData={setData}
                />

                <div className="flex items-center justify-end gap-4">
                    <Link href={route('locations.index')}>
                        <Button type="button" variant="outline">
                            Batal
                        </Button>
                    </Link>
                    <Button disabled={processing || !isFormDirty}>
                        Simpan
                    </Button>
                </div>
            </form>
        </ContentPageLayout>
    );
}

import { Link, useForm } from '@inertiajs/react';
import { useMemo, useEffect, useState } from 'react';
import ContentPageLayout from '@/components/ContentPageLayout';
import FormField from '@/components/FormField';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AssignmentManager from './Partials/AssignmentManager';
import useTranslation from '@/hooks/useTranslation';

export default function Edit({ auth, location: locationResource, locationTypes = [], allUsers = [], allRoles = [] }) {
    const { t } = useTranslation();
    const { data: location } = locationResource;
    const initialAssignments = useMemo(() => location?.users?.map((u) => ({ user_id: u.id.toString(), role_id: (u.pivot?.role_id || u.role_id || '').toString() })).filter((a) => a.role_id) || [], [location?.users]);

    const { data, setData, patch, processing, errors, isDirty } = useForm({
        name: location.name || '', type_id: location.type?.id?.toString() || '', address: location.address || '', assignments: initialAssignments,
    });

    const [isFormDirty, setIsFormDirty] = useState(false);
    useEffect(() => { setIsFormDirty(isDirty || JSON.stringify(data.assignments) !== JSON.stringify(initialAssignments)); }, [data, isDirty, initialAssignments]);

    const selectedType = useMemo(() => locationTypes.find((tp) => tp.id.toString() === data.type_id), [data.type_id, locationTypes]);
    const submit = (e) => { e.preventDefault(); patch(route('locations.update', location.id)); };

    return (
        <ContentPageLayout auth={auth} title={t('ui.edit_location')} backRoute="locations.index">
            <form onSubmit={submit} className="space-y-6">
                <Card>
                    <CardHeader><CardTitle>{t('ui.location_details')}</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                        <FormField label={t('ui.location_name')} htmlFor="name" error={errors.name}><Input id="name" placeholder={t('ui.location_name_example')} value={data.name} onChange={(e) => setData('name', e.target.value)} /></FormField>
                        <FormField label={t('ui.location_type')} htmlFor="type_id" error={errors.type_id}>
                            <Select value={data.type_id} onValueChange={(v) => setData('type_id', v)}>
                                <SelectTrigger><SelectValue placeholder={t('ui.select_location_type')} /></SelectTrigger>
                                <SelectContent>{locationTypes.map((tp) => <SelectItem key={tp.id} value={tp.id.toString()}>{tp.name}</SelectItem>)}</SelectContent>
                            </Select>
                        </FormField>
                        <FormField label={t('ui.address_optional')} htmlFor="address" error={errors.address}><Textarea id="address" placeholder={t('ui.location_address_placeholder')} value={data.address} onChange={(e) => setData('address', e.target.value)} /></FormField>
                    </CardContent>
                </Card>
                <AssignmentManager assignments={data.assignments} allUsers={allUsers} allRoles={allRoles} locationType={selectedType} errors={errors} setData={setData} />
                <div className="flex items-center justify-end gap-4">
                    <Link href={route('locations.index')}><Button type="button" variant="outline">{t('ui.cancel')}</Button></Link>
                    <Button disabled={processing || !isFormDirty}>{t('ui.save')}</Button>
                </div>
            </form>
        </ContentPageLayout>
    );
}

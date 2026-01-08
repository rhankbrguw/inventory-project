import { useForm, Link } from '@inertiajs/react';
import ContentPageLayout from '@/components/ContentPageLayout';
import FormField from '@/components/FormField';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock } from 'lucide-react';

export default function Edit({ auth, supplier: supplierResource, canEdit }) {
    const { data: supplier } = supplierResource;

    const { data, setData, put, processing, errors, isDirty } = useForm({
        name: supplier.name || '',
        contact_person: supplier.contact_person || '',
        email: supplier.email || '',
        phone: supplier.phone || '',
        address: supplier.address || '',
        notes: supplier.notes || '',
    });

    const submit = (e) => {
        e.preventDefault();
        if (!canEdit) return;
        put(route('suppliers.update', supplier.id));
    };

    return (
        <ContentPageLayout
            auth={auth}
            title="Detail Supplier"
            backRoute="suppliers.index"
        >
            <form onSubmit={submit}>
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Informasi Supplier</CardTitle>
                            {!canEdit && (
                                <div className="flex items-center gap-2 text-warning bg-warning/10 px-3 py-1 rounded-full text-xs font-medium border border-warning/20">
                                    <Lock className="w-3 h-3" />
                                    Read Only
                                </div>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label="Nama Supplier" htmlFor="name" error={errors.name}>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    disabled={!canEdit}
                                />
                            </FormField>

                            <FormField label="Kontak Person" htmlFor="contact_person" error={errors.contact_person}>
                                <Input
                                    id="contact_person"
                                    value={data.contact_person}
                                    onChange={(e) => setData('contact_person', e.target.value)}
                                    disabled={!canEdit}
                                />
                            </FormField>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label="Email" htmlFor="email" error={errors.email}>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    disabled={!canEdit}
                                />
                            </FormField>

                            <FormField label="Telepon" htmlFor="phone" error={errors.phone}>
                                <Input
                                    id="phone"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    disabled={!canEdit}
                                />
                            </FormField>
                        </div>

                        <FormField label="Alamat" htmlFor="address" error={errors.address}>
                            <Textarea
                                id="address"
                                value={data.address}
                                onChange={(e) => setData('address', e.target.value)}
                                disabled={!canEdit}
                            />
                        </FormField>

                        <div className="flex justify-end gap-4 pt-4">
                            <Link href={route('suppliers.index')}>
                                <Button type="button" variant="outline">
                                    Kembali
                                </Button>
                            </Link>

                            {canEdit && (
                                <Button disabled={processing || !isDirty}>
                                    Simpan Perubahan
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </form>
        </ContentPageLayout>
    );
}

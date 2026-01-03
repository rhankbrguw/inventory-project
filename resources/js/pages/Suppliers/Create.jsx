import { Link, useForm } from '@inertiajs/react';
import ContentPageLayout from '@/components/ContentPageLayout';
import FormField from '@/components/FormField';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { InputWithPrefix } from '@/components/InputWithPrefix';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';

export default function Create({ auth }) {
    const { data, setData, post, processing, errors, isDirty } = useForm({
        name: '',
        contact_person: '',
        email: '',
        phone: '',
        address: '',
        notes: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('suppliers.store'));
    };

    return (
        <ContentPageLayout
            auth={auth}
            title="Tambah Supplier Baru"
            backRoute="suppliers.index"
        >
            <Card>
                <CardHeader>
                    <CardTitle>Informasi Supplier</CardTitle>
                    <CardDescription>
                        Isi detail untuk supplier baru yang akan ditambahkan.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={submit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                label="Nama Supplier"
                                htmlFor="name"
                                error={errors.name}
                            >
                                <Input
                                    id="name"
                                    placeholder="Nama Perusahaan Supplier"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                />
                            </FormField>

                            <FormField
                                label="Koordinator"
                                htmlFor="contact_person"
                                error={errors.contact_person}
                            >
                                <Input
                                    id="contact_person"
                                    placeholder="Nama PIC / Sales"
                                    value={data.contact_person}
                                    onChange={(e) =>
                                        setData(
                                            'contact_person',
                                            e.target.value
                                        )
                                    }
                                />
                            </FormField>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                label="Email"
                                htmlFor="email"
                                error={errors.email}
                            >
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="email@supplier.com"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData('email', e.target.value)
                                    }
                                />
                            </FormField>

                            <FormField
                                label="Telepon"
                                htmlFor="phone"
                                error={errors.phone}
                            >
                                <InputWithPrefix
                                    prefix="+62"
                                    id="phone"
                                    placeholder="81234567890"
                                    value={data.phone}
                                    onChange={(e) =>
                                        setData(
                                            'phone',
                                            e.target.value.replace(/\D/g, '')
                                        )
                                    }
                                />
                            </FormField>
                        </div>

                        <FormField
                            label="Alamat"
                            htmlFor="address"
                            error={errors.address}
                        >
                            <Textarea
                                id="address"
                                placeholder="Alamat kantor/gudang supplier..."
                                value={data.address}
                                onChange={(e) =>
                                    setData('address', e.target.value)
                                }
                            />
                        </FormField>

                        <FormField
                            label="Catatan (Opsional)"
                            htmlFor="notes"
                            error={errors.notes}
                        >
                            <Textarea
                                id="notes"
                                placeholder="Catatan tambahan tentang supplier ini..."
                                value={data.notes}
                                onChange={(e) =>
                                    setData('notes', e.target.value)
                                }
                            />
                        </FormField>

                        <div className="flex items-center justify-end gap-4">
                            <Link href={route('suppliers.index')}>
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

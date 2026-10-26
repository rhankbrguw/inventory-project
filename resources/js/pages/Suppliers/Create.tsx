import { Link, useForm } from '@inertiajs/react';
import ContentPageLayout from '@/components/ContentPageLayout';
import FormField from '@/components/FormField';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { InputWithPrefix } from '@/components/InputWithPrefix';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import useTranslation from '@/hooks/useTranslation';

export default function Create({ auth }) {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors, isDirty } = useForm({ name: '', contact_person: '', email: '', phone: '', address: '', notes: '' });
    const submit = (e) => { e.preventDefault(); post(route('suppliers.store')); };

    return (
        <ContentPageLayout auth={auth} title={t('ui.add_new_supplier')} backRoute="suppliers.index">
            <Card>
                <CardHeader><CardTitle>{t('ui.supplier_info')}</CardTitle><CardDescription>{t('ui.supplier_info_desc')}</CardDescription></CardHeader>
                <CardContent>
                    <form onSubmit={submit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label={t('ui.supplier_name')} htmlFor="name" error={errors.name}><Input id="name" placeholder={t('ui.supplier_name_placeholder')} value={data.name} onChange={(e) => setData('name', e.target.value)} /></FormField>
                            <FormField label={t('ui.coordinator')} htmlFor="contact_person" error={errors.contact_person}><Input id="contact_person" placeholder={t('ui.coordinator_placeholder')} value={data.contact_person} onChange={(e) => setData('contact_person', e.target.value)} /></FormField>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label={t('ui.email')} htmlFor="email" error={errors.email}><Input id="email" type="email" placeholder={t('ui.supplier_email_example')} value={data.email} onChange={(e) => setData('email', e.target.value)} /></FormField>
                            <FormField label={t('ui.phone')} htmlFor="phone" error={errors.phone}><InputWithPrefix prefix="+62" id="phone" placeholder={t('ui.phone_placeholder')} value={data.phone} onChange={(e) => setData('phone', e.target.value.replace(/\D/g, ''))} /></FormField>
                        </div>
                        <FormField label={t('ui.address')} htmlFor="address" error={errors.address}><Textarea id="address" placeholder={t('ui.supplier_address_placeholder')} value={data.address} onChange={(e) => setData('address', e.target.value)} /></FormField>
                        <FormField label={t('ui.notes_optional')} htmlFor="notes" error={errors.notes}><Textarea id="notes" placeholder={t('ui.notes_placeholder')} value={data.notes} onChange={(e) => setData('notes', e.target.value)} /></FormField>
                        <div className="flex items-center justify-end gap-4">
                            <Link href={route('suppliers.index')}><Button type="button" variant="outline">{t('ui.cancel')}</Button></Link>
                            <Button disabled={processing || !isDirty}>{t('ui.save')}</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </ContentPageLayout>
    );
}

import { Link, useForm } from '@inertiajs/react';
import ContentPageLayout from '@/components/ContentPageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import useTranslation from '@/hooks/useTranslation';
import { CustomerFormFields } from './Partials/CustomerFormFields';

export default function Create({ auth, customerTypes = { data: [] } }) {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors, isDirty } = useForm({ name: '', type_id: '', email: '', phone: '', address: '' });
    const submit = (e) => { e.preventDefault(); post(route('customers.store')); };

    return (
        <ContentPageLayout auth={auth} title={t('ui.add_new_customer')} backRoute="customers.index">
            <Card>
                <CardHeader><CardTitle>{t('ui.customer_form')}</CardTitle><CardDescription>{t('ui.customer_form_desc')}</CardDescription></CardHeader>
                <CardContent>
                    <form onSubmit={submit} className="space-y-6">
                        <CustomerFormFields data={data} setData={setData} errors={errors} customerTypes={customerTypes} />
                        <div className="flex items-center gap-4 justify-end">
                            <Link href={route('customers.index')}><Button type="button" variant="outline">{t('ui.cancel')}</Button></Link>
                            <Button disabled={processing || !isDirty}>{processing ? t('ui.saving') : t('ui.save')}</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </ContentPageLayout>
    );
}

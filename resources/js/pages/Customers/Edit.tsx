import { Link, useForm } from '@inertiajs/react';
import ContentPageLayout from '@/components/ContentPageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import useTranslation from '@/hooks/useTranslation';
import { CustomerFormFields } from './Partials/CustomerFormFields';

export default function Edit({ auth, customer: customerResource, customerTypes = { data: [] } }) {
    const { t } = useTranslation();
    const { data: customer } = customerResource;
    const { data, setData, patch, processing, errors, isDirty } = useForm({
        name: customer.name || '', type_id: customer.type_id || '', email: customer.email || '',
        phone: customer.phone?.replace('+62 ', '').replace(/-/g, '') || '', address: customer.address || '',
    });
    const submit = (e) => { e.preventDefault(); patch(route('customers.update', customer.id), { preserveScroll: true }); };

    return (
        <ContentPageLayout auth={auth} title={t('ui.edit_customer')} backRoute="customers.index">
            <Card>
                <CardHeader><CardTitle>{customer.name}</CardTitle><CardDescription>{t('ui.edit_customer_desc')}</CardDescription></CardHeader>
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

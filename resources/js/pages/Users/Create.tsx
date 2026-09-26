import { Link, useForm } from '@inertiajs/react';
import ContentPageLayout from '@/components/ContentPageLayout';
import FormField from '@/components/FormField';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { InputWithPrefix } from '@/components/InputWithPrefix';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PasswordInput } from '@/components/PasswordInput';
import useTranslation from '@/hooks/useTranslation';

export default function Create({ auth, roles }) {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors, isDirty } = useForm({ name: '', email: '', phone: '', password: '', password_confirmation: '', role: '' });
    const submit = (e) => { e.preventDefault(); post(route('users.store')); };

    return (
        <ContentPageLayout auth={auth} title={t('ui.create_new_user')} backRoute="users.index">
            <Card>
                <CardHeader><CardTitle>{t('ui.user_form')}</CardTitle><CardDescription>{t('ui.user_form_desc')}</CardDescription></CardHeader>
                <CardContent>
                    <form onSubmit={submit} className="space-y-5">
                        <FormField label={t('ui.name')} htmlFor="name" error={errors.name}><Input id="name" placeholder={t('ui.full_staff_name')} value={data.name} onChange={(e) => setData('name', e.target.value)} /></FormField>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label={t('ui.email')} htmlFor="email" error={errors.email}><Input id="email" type="email" placeholder={t('ui.work_email_example')} value={data.email} onChange={(e) => setData('email', e.target.value)} /></FormField>
                            <FormField label={t('ui.phone_no')} htmlFor="phone" error={errors.phone}><InputWithPrefix prefix="+62" id="phone" placeholder={t('ui.phone_placeholder')} value={data.phone} onChange={(e) => setData('phone', e.target.value.replace(/\D/g, ''))} /></FormField>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label={t('ui.password')} htmlFor="password" error={errors.password}><PasswordInput id="password" placeholder={t('ui.min_8_chars')} value={data.password} onChange={(e) => setData('password', e.target.value)} /></FormField>
                            <FormField label={t('ui.confirm_password')} htmlFor="password_confirmation" error={errors.password_confirmation}><PasswordInput id="password_confirmation" placeholder={t('ui.repeat_password')} value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} /></FormField>
                        </div>
                        <FormField label={t('ui.role_position')} htmlFor="role" error={errors.role}>
                            <Select onValueChange={(v) => setData('role', v)}>
                                <SelectTrigger><SelectValue placeholder={t('ui.select_role')} /></SelectTrigger>
                                <SelectContent>{roles.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                            </Select>
                        </FormField>
                        <div className="flex items-center gap-4 justify-end">
                            <Link href={route('users.index')}><Button type="button" variant="outline">{t('ui.cancel')}</Button></Link>
                            <Button disabled={processing || !isDirty}>{t('ui.save')}</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </ContentPageLayout>
    );
}

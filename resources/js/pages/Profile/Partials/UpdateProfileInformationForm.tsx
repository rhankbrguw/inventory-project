import InputError from '@/components/InputError';
import { Link, useForm, usePage } from '@inertiajs/react';
import { Transition } from '@headlessui/react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { InputWithPrefix } from '@/components/InputWithPrefix';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect } from 'react';
import useTranslation from '@/hooks/useTranslation';

export default function UpdateProfileInformationForm({ mustVerifyEmail = false, status, className = '' }: { mustVerifyEmail?: boolean; status?: string; className?: string }) {
    const { t } = useTranslation();
    const { auth } = usePage<{ auth: { user: any } }>().props;
    const user = auth.user;
    const formatPhone = (p: string | null | undefined) => (!p ? '' : p.startsWith('+62') ? p.slice(3) : p.startsWith('62') ? p.slice(2) : p);

    const { data, setData, patch, errors, processing, isDirty, recentlySuccessful } = useForm({ name: user.name, email: user.email, phone: formatPhone(user.phone) });

    useEffect(() => {
        const newData = { name: user.name, email: user.email, phone: formatPhone(user.phone) };
        setData(newData);
    }, [user]);

    const submit = (e) => { e.preventDefault(); patch(route('profile.update'), { preserveScroll: true }); };

    return (
        <section className={className}>
            <CardHeader><CardTitle>{t('ui.profile_information')}</CardTitle><CardDescription>{t('ui.profile_information_desc')}</CardDescription></CardHeader>
            <CardContent>
                <form onSubmit={submit} className="mt-6 space-y-6">
                    <div>
                        <Label htmlFor="name">{t('ui.name')}</Label>
                        <Input id="name" placeholder={t('ui.full_staff_name')} className="mt-1 block w-full" value={data.name} onChange={(e) => setData('name', e.target.value)} required autoFocus autoComplete="name" />
                        <InputError className="mt-2" message={errors.name} />
                    </div>
                    <div>
                        <Label htmlFor="email">{t('ui.email')}</Label>
                        <Input id="email" type="email" placeholder={t('ui.work_email_example')} className="mt-1 block w-full" value={data.email} onChange={(e) => setData('email', e.target.value)} required autoComplete="username" />
                        <InputError className="mt-2" message={errors.email} />
                    </div>
                    <div>
                        <Label htmlFor="phone">{t('ui.phone_no')}</Label>
                        <div className="mt-1"><InputWithPrefix prefix="+62" id="phone" value={data.phone} onChange={(e) => setData('phone', e.target.value.replace(/\D/g, ''))} placeholder={t('ui.phone_placeholder')} autoComplete="tel" /></div>
                        <InputError className="mt-2" message={errors.phone} />
                    </div>
                    {mustVerifyEmail && user.email_verified_at === null && (
                        <div>
                            <p className="text-sm mt-2 text-foreground">{t('ui.unverified_email')} <Link href={route('verification.send')} method="post" as="button" className="underline text-sm text-muted-foreground hover:text-foreground">{t('ui.resend_verification')}</Link></p>
                            {status === 'verification-link-sent' && <div className="mt-2 font-medium text-sm text-success-foreground bg-success/10 p-3 rounded-lg">{t('ui.verification_sent')}</div>}
                        </div>
                    )}
                    <div className="flex items-center gap-4">
                        <Button disabled={processing || !isDirty}>{processing ? t('ui.saving') : t('ui.save')}</Button>
                        <Transition show={recentlySuccessful} enter="transition ease-in-out" enterFrom="opacity-0" leave="transition ease-in-out" leaveTo="opacity-0">
                            <p className="text-sm text-muted-foreground">{t('ui.saved')}</p>
                        </Transition>
                    </div>
                </form>
            </CardContent>
        </section>
    );
}

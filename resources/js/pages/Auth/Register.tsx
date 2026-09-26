import { useEffect } from 'react';
import GuestLayout from '@/layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import InputError from '@/components/InputError';
import { User, Mail, Lock } from 'lucide-react';
import { PasswordInput } from '@/components/PasswordInput';
import { InputWithPrefix } from '@/components/InputWithPrefix';
import useTranslation from '@/hooks/useTranslation';

export default function Register() {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors, reset } = useForm({ name: '', email: '', phone: '', password: '', password_confirmation: '' });

    useEffect(() => () => reset('password', 'password_confirmation'), []);
    const submit = (e) => { e.preventDefault(); post(route('register')); };

    return (
        <GuestLayout>
            <Head title={t('ui.register')} />
            <div className="backdrop-blur-sm bg-card/10 border border-border/20 rounded-2xl p-6 sm:p-8 shadow-xl text-foreground">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-primary to-secondary rounded-xl mb-4 shadow-lg">
                        <User className="w-7 h-7 text-primary-foreground" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">{t('ui.create_new_account')}</h1>
                </div>
                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <Label htmlFor="name" className="font-semibold block mb-1.5">{t('ui.name')}</Label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input id="name" value={data.name} placeholder={t('ui.full_staff_name')} className="w-full pl-9 bg-background/20" autoComplete="name" onChange={(e) => setData('name', e.target.value)} required />
                        </div>
                        <InputError message={errors.name} className="mt-1" />
                    </div>
                    <div>
                        <Label htmlFor="email" className="font-semibold block mb-1.5">{t('ui.email')}</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input id="email" type="email" value={data.email} placeholder={t('ui.work_email_example')} className="w-full pl-9 bg-background/20" autoComplete="username" onChange={(e) => setData('email', e.target.value)} required />
                        </div>
                        <InputError message={errors.email} className="mt-1" />
                    </div>
                    <div>
                        <Label htmlFor="phone" className="font-semibold block mb-1.5">{t('ui.phone')}</Label>
                        <InputWithPrefix prefix="+62" id="phone" value={data.phone} className="w-full bg-background/20" autoComplete="tel" placeholder={t('ui.phone_placeholder')} onChange={(e) => setData('phone', e.target.value.replace(/\D/g, ''))} />
                        <InputError message={errors.phone} className="mt-1" />
                    </div>
                    <div>
                        <Label htmlFor="password" className="font-semibold block mb-1.5">{t('ui.password')}</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <PasswordInput id="password" value={data.password} placeholder={t('ui.strong_password_placeholder')} className="w-full pl-9 pr-12 bg-background/20" autoComplete="new-password" onChange={(e) => setData('password', e.target.value)} required />
                        </div>
                        <InputError message={errors.password} className="mt-1" />
                    </div>
                    <div>
                        <Label htmlFor="password_confirmation" className="font-semibold block mb-1.5">{t('ui.confirm_password')}</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <PasswordInput id="password_confirmation" value={data.password_confirmation} placeholder={t('ui.confirm_password_placeholder')} className="w-full pl-9 pr-12 bg-background/20" autoComplete="new-password" onChange={(e) => setData('password_confirmation', e.target.value)} required />
                        </div>
                        <InputError message={errors.password_confirmation} className="mt-1" />
                    </div>
                    <div className="pt-2">
                        <Button className="w-full py-2.5 bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold rounded-xl" disabled={processing}>{t('ui.register')}</Button>
                    </div>
                </form>
                <p className="text-center text-sm text-muted-foreground mt-4">{t('ui.already_have_account')} <Link href={route('login')} className="font-bold text-foreground hover:underline">{t('ui.login_here')}</Link></p>
            </div>
        </GuestLayout>
    );
}

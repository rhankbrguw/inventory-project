import { useEffect } from 'react';
import GuestLayout from '@/layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import InputError from '@/components/InputError';
import { User, Mail, Lock, Settings } from 'lucide-react';
import { PasswordInput } from '@/components/PasswordInput';
import { InputWithPrefix } from '@/components/InputWithPrefix';
import useTranslation from '@/hooks/useTranslation';

export default function Setup() {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
    });

    useEffect(() => () => reset('password', 'password_confirmation'), []);

    const submit = (e) => {
        e.preventDefault();
        post(route('setup.store'));
    };

    return (
        <GuestLayout>
            <Head title={t('ui.setup_system')} />
            <div className="backdrop-blur-sm bg-card/10 border border-border/20 rounded-2xl p-6 sm:p-8 shadow-xl text-foreground">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-xl mb-4 shadow-lg">
                        <Settings className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">{t('ui.setup_system')}</h1>
                    <p className="text-muted-foreground text-sm">{t('ui.setup_description')}</p>
                </div>

                <form onSubmit={submit} className="space-y-5">
                    <div>
                        <Label htmlFor="name" className="font-semibold block mb-2">{t('ui.full_name')}</Label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Input
                                id="name"
                                value={data.name}
                                className="w-full pl-10 pr-4 py-3 bg-background/20 border-border/30 rounded-xl focus:border-secondary transition-all"
                                autoComplete="name"
                                placeholder={t('ui.full_name_placeholder')}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                                autoFocus
                            />
                        </div>
                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    <div>
                        <Label htmlFor="email" className="font-semibold block mb-2">{t('ui.email')}</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                className="w-full pl-10 pr-4 py-3 bg-background/20 border-border/30 rounded-xl focus:border-secondary transition-all"
                                autoComplete="username"
                                placeholder={t('ui.email_placeholder')}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                            />
                        </div>
                        <InputError message={errors.email} className="mt-2" />
                    </div>

                    <div>
                        <Label htmlFor="phone" className="font-semibold block mb-2">{t('ui.phone')}</Label>
                        <InputWithPrefix
                            prefix="+62"
                            id="phone"
                            value={data.phone}
                            className="w-full py-3 bg-background/20 border-border/30 rounded-xl focus:border-secondary transition-all"
                            autoComplete="tel"
                            placeholder="81234567890"
                            onChange={(e) => setData('phone', e.target.value.replace(/\D/g, ''))}
                        />
                        <InputError message={errors.phone} className="mt-2" />
                    </div>

                    <div>
                        <Label htmlFor="password" className="font-semibold block mb-2">{t('ui.password')}</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <PasswordInput
                                id="password"
                                value={data.password}
                                className="w-full pl-10 pr-12 py-3 bg-background/20 border-border/30 rounded-xl focus:border-secondary transition-all"
                                autoComplete="new-password"
                                placeholder={t('ui.strong_password_placeholder')}
                                onChange={(e) => setData('password', e.target.value)}
                                required
                            />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{t('ui.password_requirements')}</p>
                        <InputError message={errors.password} className="mt-2" />
                    </div>

                    <div>
                        <Label htmlFor="password_confirmation" className="font-semibold block mb-2">{t('ui.password_confirmation')}</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <PasswordInput
                                id="password_confirmation"
                                value={data.password_confirmation}
                                className="w-full pl-10 pr-12 py-3 bg-background/20 border-border/30 rounded-xl focus:border-secondary transition-all"
                                autoComplete="new-password"
                                placeholder={t('ui.confirm_password_placeholder')}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                required
                            />
                        </div>
                        <InputError message={errors.password_confirmation} className="mt-2" />
                    </div>

                    <div className="pt-4">
                        <Button
                            className="w-full py-3 bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold rounded-xl hover:shadow-lg hover:-translate-y-px transition-all duration-300"
                            disabled={processing}
                        >
                            {processing ? t('ui.processing') : t('ui.complete_setup')}
                        </Button>
                    </div>
                </form>

                <div className="mt-6 p-4 bg-muted/20 rounded-lg border border-border/30">
                    <p className="text-xs text-muted-foreground text-center">{t('ui.setup_info')}</p>
                </div>
            </div>
        </GuestLayout>
    );
}

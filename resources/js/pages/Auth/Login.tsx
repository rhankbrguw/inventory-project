import { useEffect } from 'react';
import GuestLayout from '@/layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import InputError from '@/components/InputError';
import { Checkbox } from '@/components/ui/checkbox';
import { Mail, Lock } from 'lucide-react';
import { PasswordInput } from '@/components/PasswordInput';
import ApplicationLogo from '@/components/ApplicationLogo';
import useTranslation from '@/hooks/useTranslation';

export default function Login({ canResetPassword }) {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => () => reset('password'), []);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <GuestLayout>
            <Head title={t('ui.login')} />
            <div className="bg-card border border-border/50 rounded-2xl p-6 sm:p-8 shadow-sm text-foreground">
                <div className="flex flex-col items-center text-center mb-6">
                    <ApplicationLogo className="w-14 h-14 sm:w-16 sm:h-16 mb-3" />
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                        {t('ui.welcome_back')}
                    </h1>
                    <p className="text-xs text-muted-foreground mt-1">
                        Inventory SaaS Management
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-5">
                    <div>
                        <Label
                            htmlFor="email"
                            className="font-semibold block mb-2"
                        >
                            {t('ui.email')}
                        </Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                placeholder={t('ui.email_placeholder')}
                                className="w-full pl-10 pr-4 py-3 bg-background/20 border-border/30 rounded-xl focus:border-secondary transition-all"
                                autoComplete="username"
                                onChange={(e) =>
                                    setData('email', e.target.value)
                                }
                            />
                        </div>
                        <InputError message={errors.email} className="mt-2" />
                    </div>

                    <div>
                        <Label
                            htmlFor="password"
                            className="font-semibold block mb-2"
                        >
                            {t('ui.password')}
                        </Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <PasswordInput
                                id="password"
                                value={data.password}
                                placeholder={t('ui.password_placeholder')}
                                className="w-full pl-10 pr-12 py-3 bg-background/20 border-border/30 rounded-xl focus:border-secondary transition-all"
                                autoComplete="current-password"
                                onChange={(e) =>
                                    setData('password', e.target.value)
                                }
                            />
                        </div>
                        <InputError
                            message={errors.password}
                            className="mt-2"
                        />
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center select-none cursor-pointer">
                            <Checkbox
                                id="remember"
                                name="remember"
                                checked={data.remember}
                                onCheckedChange={(checked) =>
                                    setData('remember', Boolean(checked))
                                }
                            />
                            <Label
                                htmlFor="remember"
                                className="ml-2 font-normal"
                            >
                                {t('ui.remember_me')}
                            </Label>
                        </label>
                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="font-semibold text-foreground/90 hover:text-foreground transition-colors duration-200"
                            >
                                {t('ui.forgot_password')}
                            </Link>
                        )}
                    </div>

                    <div className="pt-4">
                        <Button
                            className="w-full py-3 bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold rounded-xl hover:shadow-lg hover:-translate-y-px transition-all duration-300"
                            disabled={processing}
                        >
                            {t('ui.login')}
                        </Button>
                    </div>
                </form>

                <p className="text-center text-sm text-muted-foreground mt-6">
                    {t('ui.dont_have_account')}{' '}
                    <Link
                        href={route('register')}
                        className="font-bold text-foreground hover:text-foreground/80 transition-colors duration-200"
                    >
                        {t('ui.register_here')}
                    </Link>
                </p>
            </div>
        </GuestLayout>
    );
}

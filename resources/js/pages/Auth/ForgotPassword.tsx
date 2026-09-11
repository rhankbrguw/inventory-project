import GuestLayout from '@/layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import InputError from '@/components/InputError';
import { Mail } from 'lucide-react';
import useTranslation from '@/hooks/useTranslation';

export default function ForgotPassword({ status }) {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title={t('ui.forgot_password')} />
            <div className="backdrop-blur-sm bg-card/10 border border-border/20 rounded-2xl p-6 sm:p-8 shadow-xl text-foreground">
                <div className="mb-6 text-sm text-center text-muted-foreground">
                    {t('ui.email_password_reset')}
                </div>

                {status && (
                    <div className="mb-4 font-medium text-sm text-success-foreground bg-success/10 p-3 rounded-lg">
                        {status}
                    </div>
                )}

                <form onSubmit={submit}>
                    <div>
                        <Label htmlFor="email" className="font-semibold block mb-2">
                            {t('ui.email')}
                        </Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                placeholder={t('ui.work_email_example')}
                                className="w-full pl-10 pr-4 py-3 bg-background/20 border-border/30 rounded-xl focus:border-secondary transition-all"
                                onChange={(e) =>
                                    setData('email', e.target.value)
                                }
                                required
                            />
                        </div>
                        <InputError message={errors.email} className="mt-2" />
                    </div>

                    <div className="flex items-center justify-end mt-6">
                        <Button
                            className="w-full py-3 bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold rounded-xl hover:shadow-lg hover:-translate-y-px transition-all duration-300"
                            disabled={processing}
                        >
                            {t('ui.send_reset_link')}
                        </Button>
                    </div>
                </form>
            </div>
        </GuestLayout>
    );
}

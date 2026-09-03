import InputError from '@/components/InputError';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import GuestLayout from '@/layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import useTranslation from '@/hooks/useTranslation';

export default function VerifyOtp({ email, status }) {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors } = useForm({
        email: email || '',
        otp_code: '',
    });

    const resendForm = useForm({
        email: email || '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('otp.verify'));
    };

    const handleResend = (e) => {
        e.preventDefault();
        resendForm.post(route('verification.send'));
    };

    return (
        <GuestLayout>
            <Head title={t('ui.verify_otp')} />

            <Card className="mx-auto max-w-sm backdrop-blur-sm bg-card/10 border border-border/20 shadow-xl text-foreground">
                <CardHeader>
                    <CardTitle className="text-2xl">{t('ui.verify_account')}</CardTitle>
                    <CardDescription>
                        {t('ui.otp_sent_to')}{' '}
                        <span className="font-semibold text-foreground">
                            {email}
                        </span>
                        {t('ui.otp_enter_below')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {status && (
                        <div className="mb-4 font-medium text-sm text-success-foreground bg-success/10 p-3 rounded-lg">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit}>
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="otp_code">{t('ui.otp_code')}</Label>
                                <Input
                                    id="otp_code"
                                    type="text"
                                    name="otp_code"
                                    value={data.otp_code}
                                    placeholder="123456"
                                    className="mt-1 block w-full text-center tracking-widest text-lg font-mono font-bold"
                                    autoComplete="one-time-code"
                                    autoFocus
                                    onChange={(e) =>
                                        setData('otp_code', e.target.value)
                                    }
                                    required
                                    maxLength={6}
                                />
                                <InputError
                                    message={errors.otp_code || errors.email}
                                    className="mt-2"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={processing}
                            >
                                {t('ui.verify')}
                            </Button>
                        </div>
                    </form>

                    <div className="mt-4 text-center text-sm">
                        <span className="text-muted-foreground">
                            {t('ui.didnt_receive_code')}{' '}
                        </span>
                        <Button
                            variant="link"
                            onClick={handleResend}
                            className="p-0 h-auto"
                            disabled={resendForm.processing}
                        >
                            {t('ui.resend')}
                        </Button>
                    </div>

                    <p className="mt-4 text-center text-xs text-muted-foreground">
                        <i>{t('ui.check_spam_notice')}</i>
                    </p>
                </CardContent>
            </Card>
        </GuestLayout>
    );
}

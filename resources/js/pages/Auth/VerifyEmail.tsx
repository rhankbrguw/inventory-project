import GuestLayout from '@/layouts/GuestLayout';
import { Button } from '@/components/ui/button';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { MailCheck } from 'lucide-react';
import useTranslation from '@/hooks/useTranslation';

export default function VerifyEmail({ status }) {
    const { t } = useTranslation();
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    return (
        <GuestLayout>
            <Head title={t('ui.verify_email')} />

            <Card className="mx-auto max-w-md backdrop-blur-sm bg-card/10 border border-border/20 shadow-xl text-foreground">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
                        <MailCheck className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl mt-4">
                        {t('ui.verify_email_title')}
                    </CardTitle>
                    <CardDescription>
                        {t('ui.verify_email_desc')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {status === 'verification-link-sent' && (
                        <div className="mb-4 font-medium text-sm text-success-foreground bg-success/10 p-3 rounded-lg text-center">
                            {t('ui.verification_link_sent')}
                        </div>
                    )}

                    <form onSubmit={submit}>
                        <div className="mt-4 flex items-center justify-between">
                            <Button disabled={processing}>
                                {t('ui.resend_verification_email')}
                            </Button>
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="underline text-sm text-muted-foreground hover:text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring"
                            >
                                {t('ui.logout')}
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </GuestLayout>
    );
}
